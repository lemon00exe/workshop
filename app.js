// ============================================================
//  ⚙️  KONFIGURASI — EDIT BAGIAN INI 
// ============================================================
// MASUKKAN CONTRACT ID LO DI BAWAH INI
const CONTRACT_ID = "CA5GGKSQTJW3WUS3A3MT6YW6SKKTAEXAE3MVVFJJAPUFQ2MEBGD7WZRV";
const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";
const RPC_URL = "https://soroban-testnet.stellar.org";
// ============================================================

let publicKey = null;
let txnCount = 0;

document.getElementById("display-contract-id").textContent =
  CONTRACT_ID.includes("MASUKKAN")
    ? "⚠ Belum diset — edit CONTRACT_ID di app.js"
    : CONTRACT_ID;

// ── WALLET (VERSI ALBEDO) ───────────────────────────────────
async function connectWallet() {
  try {
    // Memanggil popup Albedo untuk minta public key
    const res = await albedo.publicKey({
        token: 'ecolog-login'
    });
    
    publicKey = res.pubkey;
    document.getElementById("btn-connect").classList.add("hidden");
    document.getElementById("wallet-badge").classList.remove("hidden");
    document.getElementById("wallet-address").textContent =
      publicKey.slice(0, 4) + "..." + publicKey.slice(-4);
    showToast("Albedo terhubung: " + publicKey.slice(0, 8) + "...", "success");
    await loadNotes();
  } catch (err) {
    showToast("Gagal connect Albedo: Dibatalkan atau error", "error");
    console.error(err);
  }
}

// ── SOROBAN RPC HELPER ──────────────────────────────────────
async function callContractReadOnly(method, args = []) {
  const { StellarSdk } = window;
  const server = new StellarSdk.SorobanRpc.Server(RPC_URL);
  const contract = new StellarSdk.Contract(CONTRACT_ID);
  const account = await server.getAccount(publicKey || "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN");
  
  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (StellarSdk.SorobanRpc.Api.isSimulationError(sim)) throw new Error(sim.error);
  return sim.result?.retval;
}

async function callContractWrite(method, args = []) {
  if (!publicKey) { showToast("Connect wallet dulu!", "error"); return null; }
  const { StellarSdk } = window;
  const server = new StellarSdk.SorobanRpc.Server(RPC_URL);
  const contract = new StellarSdk.Contract(CONTRACT_ID);
  const account = await server.getAccount(publicKey);

  let tx = new StellarSdk.TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (StellarSdk.SorobanRpc.Api.isSimulationError(sim)) throw new Error(sim.error);

  // Assemble the transaction
  tx = StellarSdk.SorobanRpc.assembleTransaction(tx, sim).build();
  
  // Tanda tangan transaksi menggunakan Albedo
  const signedRes = await albedo.tx({
      xdr: tx.toXDR(),
      network: 'testnet'
  });

  const txEnv = StellarSdk.TransactionBuilder.fromXDR(signedRes.signed_envelope_xdr, NETWORK_PASSPHRASE);
  const result = await server.sendTransaction(txEnv);

  let getResult;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 1000));
    getResult = await server.getTransaction(result.hash);
    if (getResult.status !== "NOT_FOUND") break;
  }
  if (getResult.status !== "SUCCESS") throw new Error("Transaksi gagal: " + getResult.status);
  
  txnCount++;
  document.getElementById("stat-txns").textContent = txnCount;
  return getResult;
}

// ── GET LOGS ───────────────────────────────────────────────
async function loadNotes() {
  if (CONTRACT_ID.includes("MASUKKAN")) {
    showAlert("Edit CONTRACT_ID di file app.js terlebih dahulu!");
    return;
  }
  const btn = document.getElementById("btn-refresh");
  btn.style.opacity = "0.5";
  btn.style.pointerEvents = "none";

  try {
    const retval = await callContractReadOnly("get_notes");
    const notes = parseNotesFromScVal(retval);
    renderNotes(notes);
    document.getElementById("stat-total").textContent = notes.length;
    showToast("Data berhasil dimuat dari blockchain", "success");
  } catch (err) {
    showToast("Gagal memuat data: " + err.message, "error");
    console.error(err);
  } finally {
    btn.style.opacity = "1";
    btn.style.pointerEvents = "auto";
  }
}

function parseNotesFromScVal(scVal) {
  if (!scVal) return [];
  try {
    const vec = scVal.vec() || [];
    return vec.map(item => {
      const map = item.map() || [];
      const get = (key) => {
        const entry = map.find(e => e.key.sym() === key);
        if (!entry) return "";
        const v = entry.val;
        try { return v.u64().toString(); } catch {}
        try { return v.str() || v.sym() || ""; } catch {}
        return "";
      };
      return { id: get("id"), title: get("title"), content: get("content") };
    });
  } catch (e) {
    return [];
  }
}

// ── CREATE LOG ─────────────────────────────────────────────
async function createNote() {
  const title = document.getElementById("input-title").value.trim();
  const content = document.getElementById("input-content").value.trim();
  if (!title || !content) { showToast("Jenis dan keterangan wajib diisi!", "error"); return; }
  if (!publicKey) { showToast("Connect wallet dulu!", "error"); return; }

  const btn = document.getElementById("btn-create");
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner"></div> Mengirim...';

  try {
    const { StellarSdk } = window;
    const titleArg = StellarSdk.nativeToScVal(title, { type: "string" });
    const contentArg = StellarSdk.nativeToScVal(content, { type: "string" });

    await callContractWrite("create_note", [titleArg, contentArg]);
    document.getElementById("input-title").value = "";
    document.getElementById("input-content").value = "";
    showToast("Data berhasil disimpan ke blockchain!", "success");
    await loadNotes();
  } catch (err) {
    showToast("Gagal menyimpan data. Cek console log.", "error");
    console.error(err)
  } finally {
    btn.disabled = false;
    btn.innerHTML = `
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <path d="M6.5 2v9M2 6.5h9" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      Simpan ke Blockchain`;
  }
}

// ── DELETE LOG ─────────────────────────────────────────────
async function deleteNoteById() {
  const val = document.getElementById("input-delete-id").value.trim();
  if (!val) { showToast("Masukkan ID!", "error"); return; }
  await deleteNote(val);
  document.getElementById("input-delete-id").value = "";
}

async function deleteNote(id) {
  if (!publicKey) { showToast("Connect wallet dulu!", "error"); return; }
  try {
    const { StellarSdk } = window;
    const idArg = StellarSdk.nativeToScVal(BigInt(id), { type: "u64" });
    showToast("Menghapus data...", "info");
    await callContractWrite("delete_note", [idArg]);
    showToast("Data berhasil dihapus!", "success");
    await loadNotes();
  } catch (err) {
    showToast("Gagal hapus data. Cek console log.", "error");
    console.error(err)
  }
}

// ── RENDER ──────────────────────────────────────────────────
function renderNotes(notes) {
  const grid = document.getElementById("notes-grid");
  if (!notes || notes.length === 0) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">🌱</div>Belum ada catatan aktivitas daur ulang.<br>Mulai catat kontribusimu!</div>`;
    return;
  }
  grid.innerHTML = notes.map((n, i) => `
    <div class="note-card" style="animation-delay:${i * 0.04}s">
      <div class="note-id">ID: ${esc(n.id)}</div>
      <div class="note-title">${esc(n.title)}</div>
      <div class="note-content">${esc(n.content)}</div>
      <div class="note-footer">
        <span class="note-ts">Log #${i + 1}</span>
        <button class="btn-delete" onclick="deleteNote('${esc(n.id)}')" title="Hapus catatan">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 3h8M5 3V2h2v1M4.5 5v4M7.5 5v4M3 3l.5 7h5l.5-7"
              stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  `).join("");
}

function showToast(msg, type = "success") {
  const t = document.getElementById("toast");
  document.getElementById("toast-msg").textContent = msg;
  t.className = "toast " + type;
  t.classList.remove("hidden");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.add("hidden"), 3500);
}

function showAlert(msg) {
  const el = document.getElementById("alert-banner");
  el.textContent = "⚠ " + msg;
  el.classList.remove("hidden");
}

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}