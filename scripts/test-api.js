const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('=== Test de l\'API des conversations ===');
    
    // Simuler un token JWT (vous devrez le remplacer par un vrai token)
    const token = 'your-jwt-token-here';
    
    // Test 1: Vérifier une conversation existante
    console.log('\n1. Test de vérification de conversation...');
    const checkResponse = await fetch('http://localhost:3000/api/conversations/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        memberId: '68918b0f67c9fca4e9c9f0cc' // ID d'Alice
      })
    });
    
    console.log('Status:', checkResponse.status);
    if (checkResponse.ok) {
      const data = await checkResponse.json();
      console.log('Réponse:', data);
    } else {
      const error = await checkResponse.text();
      console.log('Erreur:', error);
    }
    
    // Test 2: Créer une nouvelle conversation
    console.log('\n2. Test de création de conversation...');
    const createResponse = await fetch('http://localhost:3000/api/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        memberIds: ['68918b0f67c9fca4e9c9f0cc'] // ID d'Alice
      })
    });
    
    console.log('Status:', createResponse.status);
    if (createResponse.ok) {
      const data = await createResponse.json();
      console.log('Réponse:', data);
    } else {
      const error = await createResponse.text();
      console.log('Erreur:', error);
    }
    
  } catch (error) {
    console.error('Erreur lors du test:', error);
  }
}

// Exécuter le test
testAPI();
