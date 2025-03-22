/**
 * Script pour créer un utilisateur administrateur ou afficher les détails d'un admin existant
 * 
 * Usage: 
 * node scripts/create-admin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Importer le modèle User
const User = require('../src/models/User');

async function createAdminUser() {
  try {
    // Connexion à la base de données
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connecté à la base de données MongoDB');
    
    // Vérifier si un admin existe déjà
    const existingAdmin = await User.findOne({ email: 'admin@lydia.com' });
    
    if (existingAdmin) {
      console.log('Un utilisateur administrateur existe déjà:');
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Prénom: ${existingAdmin.firstName}`);
      console.log(`Nom: ${existingAdmin.lastName}`);
      console.log(`Rôle: ${existingAdmin.role}`);
      console.log(`ID: ${existingAdmin._id}`);
      console.log('Pour vous connecter, utilisez le mot de passe défini lors de la création.');
      
      // Option pour réinitialiser le mot de passe
      if (process.argv.includes('--reset-password')) {
        const newPassword = 'Admin@123';
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        existingAdmin.password = hashedPassword;
        await existingAdmin.save();
        
        console.log('\nMot de passe réinitialisé à: Admin@123');
        console.log('Veuillez changer ce mot de passe après la connexion.');
      }
    } else {
      // Créer un nouvel administrateur
      const adminPassword = 'Admin@123'; // Mot de passe par défaut
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      const adminUser = new User({
        firstName: 'Super',
        lastName: 'Admin',
        email: 'admin@lydia.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        emailVerified: true,
        verificationToken: null,
        permissions: ['all'],
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await adminUser.save();
      
      console.log('Utilisateur administrateur créé avec succès:');
      console.log(`Email: ${adminUser.email}`);
      console.log(`Mot de passe: ${adminPassword}`);
      console.log(`ID: ${adminUser._id}`);
      console.log('Veuillez changer ce mot de passe après la première connexion.');
    }
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur administrateur:', error);
  } finally {
    // Fermer la connexion à la base de données
    await mongoose.connection.close();
    console.log('Connexion à la base de données fermée');
  }
}

// Exécuter la fonction
createAdminUser(); 