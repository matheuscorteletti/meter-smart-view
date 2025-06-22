
const bcrypt = require('bcryptjs');
const pool = require('./src/config/database');

async function testAndFixPassword() {
  try {
    console.log('🔍 Testando senhas para admin@medidores.local...');
    
    // Buscar usuário
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      ['admin@medidores.local']
    );

    if (users.length === 0) {
      console.log('❌ Usuário não encontrado!');
      return;
    }

    const user = users[0];
    console.log('✅ Usuário encontrado:', { id: user.id, email: user.email });
    console.log('Hash atual:', user.password_hash);

    // Testar senhas comuns
    const testPasswords = ['secret', 'admin123', 'admin', 'password', '123456'];
    
    for (const testPassword of testPasswords) {
      const isMatch = await bcrypt.compare(testPassword, user.password_hash);
      console.log(`Teste "${testPassword}":`, isMatch ? '✅ MATCH' : '❌ não');
      
      if (isMatch) {
        console.log(`🎯 A senha correta é: "${testPassword}"`);
        return;
      }
    }

    // Se nenhuma senha bateu, vamos criar um novo hash para "admin123"
    console.log('🔧 Nenhuma senha testada funcionou. Criando novo hash para "admin123"...');
    
    const saltRounds = 12;
    const newHash = await bcrypt.hash('admin123', saltRounds);
    
    await pool.execute(
      'UPDATE users SET password_hash = ? WHERE email = ?',
      [newHash, 'admin@medidores.local']
    );
    
    console.log('✅ Senha atualizada para "admin123"');
    console.log('Novo hash:', newHash);
    
    // Testar o novo hash
    const testNew = await bcrypt.compare('admin123', newHash);
    console.log('Teste do novo hash:', testNew ? '✅ OK' : '❌ ERRO');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    process.exit();
  }
}

testAndFixPassword();
