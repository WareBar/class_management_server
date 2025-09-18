const express = require('express');
const cors = require('cors');
require('dotenv').config();
const supabase = require('./supabaseClient');

const app = express();
const PORT = 3000;

app.use(express.json(), cors());

// POST: Add or update a user
app.post('/users', async (req, res) => {
  const { firstName, lastName, section, status } = req.body;

  if (!firstName || !lastName || !section || !status) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    // Check if user exists
    const { data: existingUser, error: selectError } = await supabase
      .from('users')
      .select('*')
      .eq('first_name', firstName)
      .eq('last_name', lastName)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      throw selectError;
    }

    if (existingUser) {
      // Update existing user
      const { error: updateError } = await supabase
        .from('users')
        .update({ status })
        .eq('id', existingUser.id);

      if (updateError) throw updateError;

      console.log(`Updated: ${lastName}, ${firstName} → ${status}`);
      return res.status(200).json({
        message: `Attendance for ${lastName}, ${firstName} updated to ${status}`
      });
    }

    // Insert new user
    const { error: insertError } = await supabase
      .from('users')
      .insert([{ first_name: firstName, last_name: lastName, section, status }]);

    if (insertError) throw insertError;

    console.log(`Added: ${lastName}, ${firstName} → ${status}`);
    res.status(201).json({
      message: `New student ${lastName}, ${firstName} added with status: ${status}`
    });
  } catch (err) {
    console.error('Supabase error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET: All users
app.get('/users', async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    console.error('Supabase error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Root
app.get('/', (req, res) => {
  res.send('Server is up and running with Supabase 🚀');
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

module.exports = app;
