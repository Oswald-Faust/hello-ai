require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Company = require('../src/models/Company');
const logger = require('../src/utils/logger');

// Configuration de la connexion MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connecté à MongoDB'))
.catch(err => {
  console.error('Erreur de connexion à MongoDB:', err);
  process.exit(1);
});

// Fonction pour créer une entreprise système
async function createSystemCompany() {
  try {
    // Vérifier si l'entreprise système existe déjà
    let systemCompany = await Company.findOne({ name: 'System' });
    
    if (!systemCompany) {
      systemCompany = await Company.create({
        name: 'System',
        email: 'system@lydia.com',
        isActive: true,
        description: 'Entreprise système pour les comptes administrateurs',
        address: {
          street: '',
          city: '',
          postalCode: '',
          country: ''
        }
      });
      console.log('Entreprise système créée avec succès');
    } else {
      console.log('L\'entreprise système existe déjà');
    }
    
    return systemCompany;
  } catch (error) {
    console.error('Erreur lors de la création de l\'entreprise système:', error);
    process.exit(1);
  }
}

// Fonction pour créer un utilisateur administrateur
async function createAdminUser(systemCompanyId) {
  try {
    // Vérifier si l'administrateur existe déjà
    const existingAdmin = await User.findOne({ email: 'admin@lydia.com' });
    
    if (existingAdmin) {
      console.log('L\'utilisateur administrateur existe déjà');
      return existingAdmin;
    }
    
    // Créer l'administrateur
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'Lydia',
      email: 'admin@lydia.com',
      password: 'admin123', // Ce mot de passe sera hashé automatiquement par le middleware du modèle
      company: systemCompanyId,
      role: 'admin',
      isActive: true
    });
    
    console.log('Utilisateur administrateur créé avec succès');
    return adminUser;
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur administrateur:', error);
    process.exit(1);
  }
}

// Fonction principale
async function main() {
  try {
    // Créer l'entreprise système
    const systemCompany = await createSystemCompany();
    
    // Créer l'utilisateur administrateur
    const adminUser = await createAdminUser(systemCompany._id);
    
    console.log('=================================');
    console.log('Compte administrateur créé:');
    console.log('Email:', adminUser.email);
    console.log('Mot de passe: admin123');
    console.log('=================================');
    
    // Fermer la connexion à MongoDB
    await mongoose.connection.close();
    console.log('Connexion à MongoDB fermée');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de l\'exécution du script:', error);
    process.exit(1);
  }
}

// Exécuter la fonction principale
main(); 