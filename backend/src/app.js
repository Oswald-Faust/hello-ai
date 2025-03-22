// Routes
const authRoutes = require('./routes/authRoutes');
const voiceRoutes = require('./routes/voiceRoutes');
const speechRoutes = require('./routes/speechRoutes');  // Nouvelles routes pour la reconnaissance vocale

// Définition des routes
app.use('/api/auth', authRoutes);
app.use('/api/voices', voiceRoutes);
app.use('/api/speech', speechRoutes);  // Ajout des routes de reconnaissance vocale 