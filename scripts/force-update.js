const fs = require('fs');
const path = require('path');

// Uppdatera timestamp i feedback-sidan
const feedbackFile = path.join(__dirname, '../app/admin/feedback/page.tsx');
const usersFile = path.join(__dirname, '../app/admin/users/page.tsx');

function updateTimestamp(filePath, description) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Hitta och uppdatera kommentaren
    const timestamp = new Date().toLocaleString('sv-SE');
    const newComment = `{/* FORCE UPDATE: ${description} - ${timestamp} */}`;
    
    // Ersätt gammal kommentar eller lägg till ny
    if (content.includes('FORCE UPDATE:')) {
      content = content.replace(
        /\/\* FORCE UPDATE:.*?\*\//,
        newComment
      );
    } else {
      // Lägg till kommentar efter första import
      const importIndex = content.indexOf('import RefreshButton');
      if (importIndex !== -1) {
        const insertIndex = content.indexOf('\n', importIndex) + 1;
        content = content.slice(0, insertIndex) + 
                 '  ' + newComment + '\n' +
                 content.slice(insertIndex);
      }
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Uppdaterade ${description} - ${timestamp}`);
    
  } catch (error) {
    console.error(`❌ Fel vid uppdatering av ${description}:`, error.message);
  }
}

// Uppdatera båda filerna
updateTimestamp(feedbackFile, 'Feedback Admin');
updateTimestamp(usersFile, 'Users Admin');

console.log('\n🎉 Klart! Nu kan du:');
console.log('1. git add .');
console.log('2. git commit -m "Force update"');
console.log('3. git push origin main');
console.log('\nEfter deployment får du senaste data!'); 