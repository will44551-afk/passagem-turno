
import { useState, useEffect } from "react";
import { supabase } from "./utils/supabase";

function App() {
  const [servico, setServico] = useState("");
  const [usuario, setUsuario] = useState("");
const [senha, setSenha] = useState("");
const [modoCadastro, setModoCadastro] = useState(false);
const [logado, setLogado] = useState(() => {
   return false;
});
    const [responsavel, setResponsavel] = useState("");
  const [editando, setEditando] = useState(null);
  const [status, setStatus] = useState("Em andamento");
  const [observacoes, setObservacoes] = useState("");
const [foto, setFoto] = useState(null);
const [audio, setAudio] = useState(null);
const [gravandoAudio, setGravandoAudio] = useState(false);
const [gravador, setGravador] = useState(null);
const [video, setVideo] = useState(null);
const [gravandoVideo, setGravandoVideo] = useState(false);
const [gravadorVideo, setGravadorVideo] = useState(null);
const [streamVideo, setStreamVideo] = useState(null);
const [proximoNumero, setProximoNumero] = useState(() => {
  const salvo = localStorage.getItem("proximo-numero");
  return salvo ? Number(salvo) : 1;
});
 const [passagens, setPassagens] = useState([]);
const [historico, setHistorico] = useState([]);
useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setLogado(!!session);
  });
}, []);
useEffect(() => {
  async function cadastrarUsuario() {
    alert("Estou tentando criar o cadastro no Supabase!");
  if (!usuario.trim() || !senha.trim()) {
    alert("Digite seu e-mail e sua senha.");
    return;
  }
alert("Vou enviar o cadastro para o Supabase.");
  const { error } = await supabase.auth.signUp({
    email: usuario,
    password: senha,
  });
if (error) {
  alert("ERRO DO SUPABASE: " + error.message);
  return;
}
  if (error) {
    alert("Erro ao criar cadastro: " + error.message);
    return;
  }

  alert("Cadastro criado com sucesso!");
  setModoCadastro(false);
}
  async function carregarDados() {
    const { data: dadosPassagens, error: erroPassagens } = await supabase
      .from("passagens")
      .select("*")
      .order("numero", { ascending: false });

    if (erroPassagens) {
      console.error("Erro ao carregar do Supabase:", erroPassagens);
      return;
    }

    setPassagens(dadosPassagens);

    const { data: dadosHistorico, error: erroHistorico } = await supabase
      .from("historico_passagens")
      .select("*")
      .order("data", { ascending: false });

    if (erroHistorico) {
      console.error("Erro ao carregar histórico:", erroHistorico);
      return;
    }

    setHistorico(dadosHistorico);
  }

  carregarDados();
}, []);

const [pesquisa, setPesquisa] = useState("");
const [filtroStatus, setFiltroStatus] = useState("Todos");

  
  const passagensFiltradas = passagens.filter((passagem) =>
  passagem.servico.toLowerCase().includes(pesquisa.toLowerCase()) &&
  (filtroStatus === "Todos" || passagem.status === filtroStatus)
);
const emAndamento = passagensFiltradas.filter(
  (p) => p.status === "Em andamento"
);

const pendentes = passagensFiltradas.filter(
  (p) => p.status === "Pendente"
);

const concluidos = passagensFiltradas.filter(
  (p) => p.status === "Concluído"
);

const parados = passagensFiltradas.filter(
  (p) => p.status === "Parado"
);

  async function registrarPassagem(e) {
    e.preventDefault();

    if (editando !== null) {
  const { error } = await supabase
    .from("passagens")
    .update({
      servico,
      responsavel,
      status,
      observacoes,
      ultima_atualizacao: new Date().toISOString(),
    })
    .eq("id", editando);

  if (error) {
    console.error("Erro ao atualizar no Supabase:", error);
    alert("Erro ao atualizar a passagem no banco de dados.");
    return;
  }
const { error: erroHistorico } = await supabase
  .from("historico_passagens")
  .insert([
    {
      passagem_id: editando,
      acao: "Editada",
      data: new Date().toISOString(),
      detalhes: `Passagem editada. Serviço: ${servico}`,
    },
  ]);

if (erroHistorico) {
  console.error("Erro ao registrar histórico da edição:", erroHistorico);
}
  setPassagens((anteriores) =>
    anteriores.map((item) =>
      item.id === editando
        ? {
            ...item,
            servico,
            responsavel,
            status,
            observacoes,
            ultimaAtualizacao: new Date().toISOString(),
          }
        : item
    )
  );

  setEditando(null);
  setServico("");
  setResponsavel("");
  setStatus("Em andamento");
  setObservacoes("");

  return;
}
    if (!servico.trim()) {
      alert("Digite o nome do serviço.");
      return;
    }

    const novaPassagem = {
  id: Date.now(),
  numero: proximoNumero,
  servico,
  responsavel,
  status,
  observacoes,
  foto,
  audio,
  video,
  data: new Date().toISOString(),
};

const { error } = await supabase
  .from("passagens")
  .insert([novaPassagem]);

if (error) {
  console.error("Erro ao salvar no Supabase:", error);
  alert("Erro ao salvar a passagem no banco de dados.");
  return;
}
const { error: erroHistorico } = await supabase
  .from("historico_passagens")
  .insert([
    {
      passagem_id: novaPassagem.id,
      acao: "Criada",
      data: new Date().toISOString(),
      detalhes: `Passagem ${novaPassagem.numero} criada para o serviço ${novaPassagem.servico}`,
    },
  ]);

if (erroHistorico) {
  console.error("Erro ao registrar histórico:", erroHistorico);
}

setPassagens((anteriores) => {
  
setProximoNumero(proximoNumero + 1);
localStorage.setItem("proximo-numero", String(proximoNumero + 1));

  return [novaPassagem, ...anteriores];
});

    setServico("");
    setResponsavel("");
    setStatus("Em andamento");
    setObservacoes("");
    setFoto(null);
setAudio(null);
  }
   if (!logado) {
  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "80px auto",
        padding: "30px",
        border: "1px solid #ccc",
        borderRadius: "10px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
     <h2 style={{ textAlign: "center" }}>
  {modoCadastro ? "Criar conta" : "Login"}
</h2>

      <label>Usuário</label>
      <input
        type="text"
        value={usuario}
        onChange={(e) => setUsuario(e.target.value)}
        placeholder="Digite seu usuário"
        style={{
          display: "block",
          width: "100%",
          padding: "10px",
          margin: "8px 0 16px",
          boxSizing: "border-box",
        }}
      />

      <label>Senha</label>
      <input
        type="password"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        placeholder="Digite sua senha"
        style={{
          display: "block",
          width: "100%",
          padding: "10px",
          margin: "8px 0 16px",
          boxSizing: "border-box",
        }}
      />

      <button
        onClick={async () => {
  if (modoCadastro) {
  alert("Entrou no botão de criar cadastro!");
  await cadastrarUsuario();
  return;
}
  const { error } = await supabase.auth.signInWithPassword({
    email: usuario,
    password: senha,
  });

  if (error) {
    alert("E-mail ou senha incorretos.");
    return;
  }

  setLogado(true);
  
}}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: "#3498db",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
      {modoCadastro ? "Criar conta" : "Entrar"}
      </button>
      <button
  onClick={() => {
  alert("Botão Criar conta clicado!");
  setModoCadastro(!modoCadastro);
}}
  style={{
    width: "100%",
    padding: "10px",
    marginTop: "10px",
    backgroundColor: "#27ae60",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  }}
>
  {modoCadastro ? "Voltar para login" : "Criar conta"}
</button>
    </div>
  );
}

  return (
    
    <main style={{ maxWidth: "700px", margin: "0 auto", padding: "20px", fontFamily: "Arial", boxSizing: "border-box", width: "100%" }}>
      <h1>Passagem de Turno</h1>
      <button
  className="nao-imprimir"
  onClick={async () => {
  await supabase.auth.signOut();
    setLogado(false);
    setUsuario("");
    setSenha("");
  }}
  style={{
    padding: "8px 14px",
    backgroundColor: "#e74c3c",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginBottom: "15px",
  }}
>
  Sair
</button>
 <div className="resumo-nao-imprimir" style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "10px",
        margin: "20px 0"
      }}>
        <div style={{ background: "#e3f2fd", padding: "12px", borderRadius: "8px" }}>
          <strong>Em andamento</strong>
          <h2>{passagens.filter(p => p.status === "Em andamento").length}</h2>
        </div>

        <div style={{ background: "#e8f5e9", padding: "12px", borderRadius: "8px" }}>
          <strong>Concluídos</strong>
          <h2>{passagens.filter(p => p.status === "Concluído").length}</h2>
        </div>

        <div style={{ background: "#fff3e0", padding: "12px", borderRadius: "8px" }}>
          <strong>Pendentes</strong>
          <h2>{passagens.filter(p => p.status === "Pendente").length}</h2>
        </div>

        <div style={{ background: "#ffebee", padding: "12px", borderRadius: "8px" }}>
          <strong>Parados</strong>
          <h2>{passagens.filter(p => p.status === "Parado").length}</h2>
        </div>
      </div>
      <button
  type="button"
  onClick={() => window.print()}
  style={{
    display: "block",
    width: "100%",
    padding: "12px",
    margin: "10px 0 20px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px"
  }}
>
  Imprimir Passagem de Turno
</button>

      <form className="formulario-nao-imprimir" onSubmit={registrarPassagem}>
        <label>Nome do serviço</label>
        <input
          value={servico}
          onChange={(e) => setServico(e.target.value)}
          placeholder="Digite o nome do serviço"
          required
          style={{ display: "block", width: "100%", padding: "10px", margin: "8px 0 16px", boxSizing: "border-box" }}
        />
         <label className="nao-imprimir">Responsável</label>

<input
  value={responsavel}
  onChange={(e) => setResponsavel(e.target.value)}
  placeholder="Digite o nome do responsável"
  style={{
    display: "block",
    width: "100%",
    padding: "10px",
    margin: "8px 0 16px",
    boxSizing: "border-box"
  }}
/>

<label className="nao-imprimir">Filtrar por status</label>

<select
  value={filtroStatus}
  onChange={(e) => setFiltroStatus(e.target.value)}
  style={{
    width: "100%",
    padding: "12px",
    margin: "8px 0 16px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "16px",
    boxSizing: "border-box"
  }}
>
  <option value="Todos">Todos os status</option>
  <option value="Em andamento">Em andamento</option>
  <option value="Concluído">Concluído</option>
  <option value="Pendente">Pendente</option>
  <option value="Parado">Parado</option>
</select>
        <label className="nao-imprimir">Status</label>
        <select
  value={status}
  onChange={(e) => setStatus(e.target.value)}
  style={{
    width: "100%",
    padding: "12px",
    margin: "8px 0 16px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "16px",
    boxSizing: "border-box"
  }}
>
  <option value="Em andamento">Em andamento</option>
  <option value="Concluído">Concluído</option>
  <option value="Pendente">Pendente</option>
  <option value="Parado">Parado</option>
</select>
<label className="nao-imprimir">Foto</label>

<input
  type="file"
  accept="image/*"
  className="nao-imprimir"
  onChange={(e) => {
  const arquivo = e.target.files[0];

  if (!arquivo) return;

  const leitor = new FileReader();

  leitor.onloadend = () => {
    setFoto(leitor.result);
  };

  leitor.readAsDataURL(arquivo);
}}
/>
<div className="nao-imprimir" style={{ marginTop: "16px" }}>
  <button
    type="button"
    onClick={async () => {
  if (gravandoAudio) {
    gravador.stop();
    gravador.stream.getTracks().forEach((track) => track.stop());
    setGravandoAudio(false);
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const novoGravador = new MediaRecorder(stream);

    novoGravador.start();

    setGravador(novoGravador);
    setGravandoAudio(true);

    novoGravador.ondataavailable = (evento) => {
        const leitor = new FileReader();

  leitor.onloadend = () => {
    setAudio(leitor.result);
  };

  leitor.readAsDataURL(evento.data);
    };
  } catch (erro) {
    alert("Não foi possível acessar o microfone.");
  }
}}
    style={{
      padding: "10px 16px",
      border: "none",
      borderRadius: "8px",
      background: "#2563eb",
      color: "white",
      cursor: "pointer",
    }}
  >
    🎙️ Gravar áudio
  </button>
</div>
<div className="nao-imprimir" style={{ marginTop: "16px" }}>
  <button
    type="button"
    onClick={async () => {
      if (gravandoVideo) {
  gravadorVideo.stop();
  setGravandoVideo(false);
  return;
}

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
setStreamVideo(stream);
const partesVideo = [];
        const novoGravadorVideo = new MediaRecorder(stream, {
  mimeType: "video/webm;codecs=vp8,opus",
});


novoGravadorVideo.ondataavailable = (evento) => {
  if (evento.data.size > 0) {
    partesVideo.push(evento.data);
  }
};
novoGravadorVideo.onstop = () => {
  alert("A gravação foi finalizada!");
  const blobVideo = new Blob(partesVideo, {
  type: "video/webm",
});
alert("Tamanho do vídeo: " + blobVideo.size + " bytes");
const urlVideo = URL.createObjectURL(blobVideo);
  const leitor = new FileReader();

  leitor.onloadend = () => {
    alert("O vídeo foi carregado!");
    setVideo(leitor.result);
    alert("setVideo foi executado!");
  };

  leitor.readAsDataURL(blobVideo);

  stream.getTracks().forEach((track) => track.stop());
  setStreamVideo(null);
};
novoGravadorVideo.start(1000);

setGravadorVideo(novoGravadorVideo);
setGravandoVideo(true);
      } catch (erro) {
        alert("Não foi possível acessar a câmera e o microfone.");
      }
    }}
    style={{
      padding: "10px 16px",
      border: "none",
      borderRadius: "8px",
      background: "#7c3aed",
      color: "white",
      cursor: "pointer",
    }}
  >
    {gravandoVideo ? "⏹️ Parar vídeo" : "🎥 Gravar vídeo"}
  </button>
</div>
{streamVideo && (
  <div style={{ marginTop: "10px", marginBottom: "16px" }}>
    <strong>Câmera:</strong>
    <br />
    <video
      autoPlay
      muted
      playsInline
      ref={(elemento) => {
        if (elemento) {
          elemento.srcObject = streamVideo;
        }
      }}
      style={{
        width: "100%",
        maxWidth: "400px",
        marginTop: "8px",
        borderRadius: "8px",
      }}
    />
  </div>
)}
{video && (
  <div>
    <p>Vídeo carregado com sucesso!</p>
    <video
      controls
      src={video}
      style={{
        width: "100%",
        maxWidth: "400px",
        marginTop: "8px",
        borderRadius: "8px",
      }}
    />
  </div>
)}
        <label className="nao-imprimir">Observações</label>
        <textarea
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          placeholder="Descreva o que o próximo turno precisa saber"
          rows="4"
          style={{
  display: "block",
  width: "100%",
  padding: "12px",
  margin: "8px 0 16px",
  border: "1px solid #ccc",
  borderRadius: "8px",
  fontSize: "16px",
  boxSizing: "border-box",
  resize: "vertical"
}}
        />

        <button
  type="submit"
  style={{
    width: "100%",
    padding: "12px",
    marginTop: "5px",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
    backgroundColor: "#3498db",
    color: "white"
  }}
>
  {editando !== null ? "Salvar Alteração" : "Registrar Passagem de Turno"}
</button>
      </form>

      <section style={{ marginTop: "30px" }}>
      <div
  className="dashboard nao-imprimir"
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
    marginBottom: "20px"
  }}
>
  <div
  className="card-dashboard"
  style={{
    border: "2px solid #3498db",
    borderRadius: "10px",
    padding: "15px",
    textAlign: "center"
  }}
>
  <h3>Em andamento</h3>
  <strong style={{ fontSize: "28px" }}>{emAndamento.length}</strong>
</div>

  <div
  className="card-dashboard"
  style={{
    border: "2px solid #27ae60",
    borderRadius: "10px",
    padding: "15px",
    textAlign: "center"
  }}
>
  <h3>Concluídos</h3>
  <strong style={{ fontSize: "28px" }}>{concluidos.length}</strong>
</div>

  <div
  className="card-dashboard"
  style={{
    border: "2px solid #f39c12",
    borderRadius: "10px",
    padding: "15px",
    textAlign: "center"
  }}
>
  <h3>Pendentes</h3>
  <strong style={{ fontSize: "28px" }}>{pendentes.length}</strong>
</div>

  <div
  className="card-dashboard"
  style={{
    border: "2px solid #e74c3c",
    borderRadius: "10px",
    padding: "15px",
    textAlign: "center"
  }}
>
  <h3>Parados</h3>
  <strong style={{ fontSize: "28px" }}>{parados.length}</strong>
</div>
</div>
        <h2 className="nao-imprimir">Passagens registradas</h2>
        <div className="somente-impressao">
  <h2>Relatório de Passagem de Turno</h2>
  <p>Data e hora: {new Date().toLocaleString("pt-BR")}</p>
</div>
<details
  className="nao-imprimir"
  style={{
    marginTop: "20px",
    padding: "15px",
    borderRadius: "10px",
    backgroundColor: "#1f1f1f",
    color: "white",
  }}
>
  <summary
  style={{
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "bold",
    padding: "8px",
  }}
>
    📋 Histórico de alterações
  </summary>
<div className="nao-imprimir">
  {historico.length === 0 ? (
    <p>Nenhuma alteração registrada.</p>
  ) : (
    historico.map((item) => (
      <div key={item.id}>
        <p>
          <strong>{item.acao}</strong> — {item.detalhes}
        </p>
        <p>
          Data: {new Date(item.data).toLocaleString("pt-BR")}
        </p>
      </div>
    ))
  )}
</div>
</details>
<div className="relatorio-status">
  <p className="linha-relatorio"></p>

  <h3 className="titulo-relatorio">Em andamento ({emAndamento.length})</h3>
{emAndamento.map((p) => (
  <p key={p.id}>
    • {p.servico}<br />
    Observações: {p.observacoes || "Nenhuma"}<br />
    Data: {p.data}
  </p>
))}

  <h3 className="titulo-relatorio">Pendentes ({pendentes.length})</h3>
  <h3 className="titulo-relatorio">Concluídos ({concluidos.length})</h3>
  {pendentes.map((p) => (
    <p key={p.id}>
  • {p.servico}<br />
  Observações: {p.observacoes || "Nenhuma"}<br />
  Data: {p.data}
</p>
  ))}

  <h3 className="titulo-relatorio">Parados ({parados.length})</h3>
  {concluidos.map((p) => (
    <p key={p.id}>
  • {p.servico}<br />
  Observações: {p.observacoes || "Nenhuma"}<br />
  Data: {p.data}
</p>
  ))}
</div>
        <input
  placeholder="Pesquisar serviço..."
  value={pesquisa}
onChange={(e) => setPesquisa(e.target.value)}
  style={{
  display: "block",
  width: "100%",
  padding: "12px",
  margin: "8px 0 16px",
  boxSizing: "border-box",
  border: "1px solid #ccc",
  borderRadius: "8px",
  fontSize: "16px"
}}
/>

        {passagens.length === 0 ? (
          <p>Nenhuma passagem registrada ainda.</p>
        ) : (
          passagensFiltradas.map((passagem) => (
            <article className="lista-normal" key={passagem.id} style={{
    border: "1px solid #ccc",
    padding: "18px",
    marginBottom: "15px",
    borderRadius: "10px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  }}
>
              <h3>{passagem.servico}</h3>
              <p>

  <strong>Status:</strong>{" "}
  <span
    style={{
      color:
        passagem.status === "Concluído"
          ? "green"
          : passagem.status === "Pendente"
          ? "orange"
          : passagem.status === "Parado"
          ? "red"
          : "blue",
      fontWeight: "bold"
    }}
  >
    {passagem.status}
  </span>
</p>
  <p style={{ marginBottom: "10px" }}>
  <strong>Responsável:</strong> {passagem.responsavel || "Não informado"}
</p>

<p style={{ marginBottom: "10px" }}>
  <strong>Observações:</strong> {passagem.observacoes || "Nenhuma"}
</p>

<p style={{ marginBottom: "10px" }}>
  <strong>Criado em:</strong> {new Date(passagem.data).toLocaleString("pt-BR")}
</p>

{passagem.ultimaAtualizacao && (
  <p style={{ marginBottom: "10px" }}>
    <strong>Última atualização:</strong> {new Date(passagem.ultimaAtualizacao).toLocaleString("pt-BR")}
  </p>
)}
              {passagem.foto && (
                
  <div style={{ marginTop: "15px" }}>
    <strong>Foto:</strong>
    <br />
    <img
      src={passagem.foto}
      alt="Foto da passagem"
      style={{
        maxWidth: "300px",
        maxHeight: "300px",
        marginTop: "8px",
        borderRadius: "8px",
      }}
    />
  </div>
)}
{passagem.audio && (
  <div style={{ marginTop: "15px" }}>
    <strong>Áudio:</strong>
    <br />
    <audio controls src={passagem.audio} />
  </div>
)}
{passagem.video && (
  <div style={{ marginTop: "15px" }}>
    <strong>Vídeo:</strong>
    <br />
    <video
      controls
      src={passagem.video}
      style={{
        maxWidth: "400px",
        maxHeight: "300px",
        borderRadius: "8px",
      }}
    />
  </div>
)}
              
              <button
               className="nao-imprimir"
               style={{
  marginRight: "8px",
  padding: "8px 14px",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
  backgroundColor: "#e74c3c",
color: "white",
}}
  onClick={async () => {
  const { error } = await supabase
    .from("passagens")
    .delete()
    .eq("id", passagem.id);

  if (error) {
    console.error("Erro ao excluir no Supabase:", error);
    alert("Erro ao excluir a passagem do banco de dados.");
    return;
  }
const { error: erroHistorico } = await supabase
  .from("historico_passagens")
  .insert([
    {
      passagem_id: passagem.id,
      acao: "Excluída",
      data: new Date().toISOString(),
      detalhes: `Passagem ${passagem.numero} excluída. Serviço: ${passagem.servico}`,
    },
  ]);

if (erroHistorico) {
  console.error("Erro ao registrar histórico da exclusão:", erroHistorico);
}
  setPassagens((anteriores) =>
    anteriores.filter((item) => item.id !== passagem.id)
  );
}}
>
  Excluir
</button>
<button
 className="nao-imprimir"
 style={{
  marginRight: "8px",
  padding: "8px 14px",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
  backgroundColor: "#3498db",
color: "white",
}}
  onClick={() => {
    setEditando(passagem.id);
    setServico(passagem.servico);
    setResponsavel(passagem.responsavel || "");
    setStatus(passagem.status);
    setObservacoes(passagem.observacoes);
  }}
>
  Editar
</button>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
const estiloImpressao = document.createElement("style");
estiloImpressao.innerHTML = `
  @media print {
    .somente-impressao {
      display: block;
    }

    button, input, select, textarea {
      display: none !important;
    }
  }

  .somente-impressao {
    display: none;
  }
    .relatorio-status {
  display: none;
}
  .titulo-relatorio {
  border-bottom: 2px solid #000;
  padding-bottom: 5px;
  margin-top: 25px;
}

@media print {
  .relatorio-status {
    display: block;
  }
    .lista-normal {
  display: none !important;
}.resumo-nao-imprimir {
  display: none !important;
}
  h2.nao-imprimir {
  display: none !important;
}
  .formulario-nao-imprimir {
    display: none !important;
  }
}

}
`;
document.head.appendChild(estiloImpressao);

export default App;