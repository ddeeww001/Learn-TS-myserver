const API_URL = '/api/users';

// เมื่อโหลดหน้าเว็บเสร็จสมบูรณ์
document.addEventListener('DOMContentLoaded', () => {
  fetchUsers();

  // ผูก Event Listeners ให้กับองค์ประกอบต่างๆ
  document.getElementById('userForm').addEventListener('submit', handleFormSubmit);
  document.getElementById('cancelBtn').addEventListener('click', resetForm);
  document.getElementById('refreshBtn').addEventListener('click', fetchUsers);
});

// ฟังก์ชันแสดงการแจ้งเตือน (Alert)
function showAlert(message, isError = false) {
  const alertBox = document.getElementById('alertBox');
  alertBox.textContent = message;
  alertBox.className = `p-4 rounded-lg text-sm font-medium shadow-sm transition-all ${
    isError 
      ? 'bg-red-50 text-red-700 border border-red-200' 
      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
  }`;
  alertBox.classList.remove('hidden');

  setTimeout(() => {
    alertBox.classList.add('hidden');
  }, 4000);
}

// 1. ดึงผู้ใช้ทั้งหมดจาก Backend (GET)
async function fetchUsers() {
  try {
    const response = await fetch(API_URL);
    const users = await response.json();

    const tableBody = document.getElementById('userTableBody');
    
    if (!response.ok) {
      throw new Error(users.message || 'ไม่สามารถโหลดข้อมูลได้');
    }

    if (users.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="4" class="p-6 text-center text-slate-400">ยังไม่มีข้อมูลผู้ใช้งานในระบบ</td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = users.map(user => `
      <tr class="hover:bg-slate-50/80 transition">
        <td class="p-3 text-xs font-mono text-slate-400">${user._id}</td>
        <td class="p-3 font-medium text-slate-700">${escapeHtml(user.name)}</td>
        <td class="p-3 text-slate-600">${escapeHtml(user.email)}</td>
        <td class="p-3 text-center space-x-1">
          <button onclick="editUser('${user._id}', '${escapeHtml(user.name)}', '${escapeHtml(user.email)}')" 
            class="px-2.5 py-1 text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-md transition">
            ✏️ แก้ไข
          </button>
          <button onclick="deleteUser('${user._id}')" 
            class="px-2.5 py-1 text-xs bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-md transition">
            🗑️ ลบ
          </button>
        </td>
      </tr>
    `).join('');

  } catch (error) {
    showAlert(error.message, true);
  }
}

// 2. เพิ่มข้อมูลใหม่ หรือ อัปเดตข้อมูล (POST / PUT)
async function handleFormSubmit(event) {
  event.preventDefault();

  const userId = document.getElementById('userId').value;
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const isEdit = Boolean(userId);
  const url = isEdit ? `${API_URL}/${userId}` : API_URL;
  const method = isEdit ? 'PUT' : 'POST';

  const payload = { name, email };
  if (!isEdit) payload.password = password;

  try {
    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      // แสดงข้อความ Error ที่ถูกส่งมาจาก Utils / Controller ฝั่ง Backend
      throw new Error(result.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }

    showAlert(isEdit ? 'อัปเดตข้อมูลสำเร็จ!' : 'เพิ่มผู้ใช้สำเร็จ!');
    resetForm();
    fetchUsers();

  } catch (error) {
    showAlert(error.message, true);
  }
}

// 3. เตรียมข้อมูลเข้าฟอร์มเมื่อกดแก้ไข
function editUser(id, name, email) {
  document.getElementById('userId').value = id;
  document.getElementById('name').value = name;
  document.getElementById('email').value = email;
  
  // ซ่อนช่องกรอกรหัสผ่านเวลาอัปเดต
  document.getElementById('passwordContainer').classList.add('hidden');
  document.getElementById('password').removeAttribute('required');

  document.getElementById('formTitle').innerHTML = '✏️ แก้ไขข้อมูลผู้ใช้';
  document.getElementById('submitBtn').textContent = 'อัปเดตข้อมูล';
  document.getElementById('cancelBtn').classList.remove('hidden');
}

// 4. ลบข้อมูลผู้ใช้ (DELETE)
async function deleteUser(id) {
  if (!confirm('คุณต้องการลบผู้ใช้งานนี้ใช่หรือไม่?')) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'ไม่สามารถลบข้อมูลได้');
    }

    showAlert('ลบผู้ใช้งานเรียบร้อยแล้ว');
    fetchUsers();

  } catch (error) {
    showAlert(error.message, true);
  }
}

// ล้างข้อมูลในฟอร์มกลับเป็นค่าเริ่มต้น
function resetForm() {
  document.getElementById('userForm').reset();
  document.getElementById('userId').value = '';
  
  document.getElementById('passwordContainer').classList.remove('hidden');
  document.getElementById('password').setAttribute('required', 'true');

  document.getElementById('formTitle').innerHTML = '<span>➕</span> เพิ่มผู้ใช้ใหม่';
  document.getElementById('submitBtn').textContent = 'บันทึกข้อมูล';
  document.getElementById('cancelBtn').classList.add('hidden');
}

// ป้องกัน XSS
function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}