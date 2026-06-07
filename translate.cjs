const fs = require('fs');
const path = require('path');

const replacements = {
  // Arquivos renomeados (paths)
  'POSContext': 'PDVContext',
  'AuthContext': 'AutenticacaoContext',
  'ToastContext': 'AvisoContext',
  'PaymentModal': 'ModalPagamento',
  'Receipt': 'Recibo',
  'BarcodeScanner': 'LeitorCodigoBarras',
  'ClienteSearch': 'BuscaCliente',
  'ProductModal': 'ModalProduto',
  'DeleteConfirmModal': 'ModalConfirmarExclusao',
  'MainLayout': 'LayoutPrincipal',
  'Sidebar': 'MenuLateral',

  // Providers
  'POSProvider': 'PDVProvider',
  'AuthProvider': 'AutenticacaoProvider',
  'ToastProvider': 'AvisoProvider',
};

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      for (const [search, replace] of Object.entries(replacements)) {
        const regex = new RegExp(`\\b${search}\\b`, 'g');
        if (regex.test(content)) {
          content = content.replace(regex, replace);
          changed = true;
        }
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

replaceInDir('./src');
replaceInDir('./server');
replaceInDir('./'); // raiz para pegar App.jsx
console.log('Tradução base 2 concluída!');
