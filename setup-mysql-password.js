#!/usr/bin/env node

/**
 * MySQL Password Setup Script
 * This script helps you set up MySQL password for the managenow database
 */

const readline = require('readline');
const { spawn } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n=== MySQL Password Setup for ManageNow ===\n');
console.log('Mari kita set password untuk MySQL root user.');
console.log('Kalau belum punya password, tekan Enter saja.\n');

rl.question('Masukkan password MySQL root yang sekarang (atau Enter kalau kosong): ', (currentPassword) => {
  rl.question('Masukkan password baru untuk root (atau Enter untuk "managenow123"): ', (newPassword) => {
    
    const finalPassword = newPassword || 'managenow123';
    
    console.log('\n🔄 Mencoba mengubah password...\n');
    
    // Try to connect and change password
    const mysqlArgs = ['-u', 'root'];
    if (currentPassword) {
      mysqlArgs.push(`-p${currentPassword}`);
    }
    
    const mysql = spawn('/usr/local/mysql/bin/mysql', mysqlArgs);
    
    mysql.stdin.write(`ALTER USER 'root'@'localhost' IDENTIFIED BY '${finalPassword}';\n`);
    mysql.stdin.write(`FLUSH PRIVILEGES;\n`);
    mysql.stdin.write(`SELECT 'Password changed successfully!' as status;\n`);
    mysql.stdin.write(`EXIT;\n`);
    mysql.stdin.end();
    
    let output = '';
    let errorOutput = '';
    
    mysql.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    mysql.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    mysql.on('close', (code) => {
      if (code === 0 && output.includes('Password changed successfully!')) {
        console.log('✅ Password berhasil diubah!\n');
        console.log(`Password baru: ${finalPassword}\n`);
        console.log('Simpan info ini untuk .env.local:');
        console.log('DB_HOST=localhost');
        console.log('DB_PORT=3306');
        console.log('DB_USER=root');
        console.log(`DB_PASSWORD=${finalPassword}`);
        console.log('DB_NAME=managenow\n');
      } else {
        console.log('❌ Gagal mengubah password.\n');
        console.log('Error:', errorOutput);
        console.log('\n💡 Solusi alternatif:');
        console.log('1. Buka System Settings > MySQL');
        console.log('2. Klik "Stop MySQL Server"');
        console.log('3. Buka Terminal dan jalankan:');
        console.log('   sudo /usr/local/mysql/support-files/mysql.server stop');
        console.log('   sudo /usr/local/mysql/bin/mysqld_safe --skip-grant-tables &');
        console.log('   /usr/local/mysql/bin/mysql -u root');
        console.log('   (lalu paste command SQL di atas)\n');
      }
      rl.close();
    });
  });
});
