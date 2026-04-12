const scenes = [
  {
    kicker: "Scene 1",
    title: "Follower timeout starts a new term.",
    simple:
      "Plain English: if the current leader goes quiet for too long, one follower says, 'I think the leader is gone. Let's vote for a new one.'",
    description:
      "A follower stops hearing heartbeats within its randomized election timeout, increments the term, votes for itself, and becomes a candidate.",
    facts: ["Randomized timeout", "Self-vote", "New term"],
    banner: "Heartbeat missing",
    whatHappens:
      "One follower stops hearing valid heartbeats before its election timer expires. It increases its term and starts trying to become leader.",
    whyMatters:
      "Without timeouts and re-election, the cluster would stay stuck after a leader failure. Randomized timeouts reduce synchronized elections and split votes.",
    interview:
      "A follower becomes a candidate after missing heartbeats for longer than a randomized election timeout. It increments term, votes for itself, and sends RequestVote RPCs.",
    caption:
      "No leader heartbeat arrives in time, so one node advances the election.",
    messages: ["heartbeat missing", "election timer fires", "RequestVote begins"],
    logs: ["[1][2][3]", "[1][2][3]", "[1][2][3]"],
    nodes: [
      { id: "A", role: "Candidate", term: "term 8", classes: ["is-candidate", "is-busy"] },
      { id: "B", role: "Follower", term: "term 7", classes: ["is-follower"] },
      { id: "C", role: "Follower", term: "term 7", classes: ["is-follower"] }
    ]
  },
  {
    kicker: "Scene 2",
    title: "The candidate asks peers for votes.",
    simple:
      "Plain English: the candidate asks the others, 'Will you trust me to lead this round?'",
    description:
      "Peers compare the candidate's term and log freshness. A server can vote once per term, and the candidate wins only with a majority.",
    facts: ["RequestVote RPC", "One vote per term", "Majority required"],
    banner: "Vote request",
    whatHappens:
      "Each voter checks two big things: is the candidate's term current, and is the candidate's log at least as up to date as mine?",
    whyMatters:
      "The up-to-date log rule helps preserve committed history. A stale node should not become leader and overwrite good history.",
    interview:
      "Raft grants at most one vote per term, and a candidate can only win if its log is sufficiently up to date and it obtains a majority.",
    caption:
      "Vote splitting is possible, which is why randomized timeouts help one candidate pull ahead.",
    messages: ["RequestVote(A->B)", "RequestVote(A->C)", "majority needed"],
    logs: ["[1][2][3]", "[1][2][3]", "[1][2][3]"],
    nodes: [
      { id: "A", role: "Candidate", term: "term 8", classes: ["is-candidate", "is-busy"] },
      { id: "B", role: "Voter", term: "term 8", classes: ["is-follower"] },
      { id: "C", role: "Voter", term: "term 8", classes: ["is-follower"] }
    ]
  },
  {
    kicker: "Scene 3",
    title: "The leader replicates, then commits on quorum.",
    simple:
      "Plain English: the leader writes the update, asks followers to copy it, and only says 'done' after most of them agree.",
    description:
      "After winning, the leader appends the command, sends replication RPCs, and only commits once a majority has acknowledged the entry.",
    facts: ["AppendEntries", "Quorum ACK", "State machine apply"],
    banner: "Replicate then commit",
    whatHappens:
      "The leader accepts a client write, appends it to its own log, sends AppendEntries to followers, and waits for a majority acknowledgment before committing.",
    whyMatters:
      "This is the core durability rule. Majority confirmation is what protects committed history across crashes and future elections.",
    interview:
      "Replicated does not automatically mean committed. The leader commits only after a majority acknowledges the entry, then followers apply it once informed of the commit.",
    caption:
      "Replication alone is not enough. Commitment requires the majority rule that makes future leaders preserve the history.",
    messages: ["client write", "AppendEntries", "majority ACK -> commit"],
    logs: ["[1][2][3][4*]", "[1][2][3][4*]", "[1][2][3][4 ]"],
    nodes: [
      { id: "A", role: "Leader", term: "term 8", classes: ["is-leader", "is-busy"] },
      { id: "B", role: "Follower", term: "term 8", classes: ["is-follower"] },
      { id: "C", role: "Follower", term: "term 8", classes: ["is-follower"] }
    ]
  },
  {
    kicker: "Scene 4",
    title: "Partitioned leaders cannot safely keep writing.",
    simple:
      "Plain English: a leader cut off from most of the cluster may still think it is in charge, but it cannot safely finalize new work.",
    description:
      "If the old leader gets isolated in the minority, it may still think it is leader briefly, but it cannot commit without quorum. The majority side elects a new leader.",
    facts: ["Minority cannot commit", "Higher term wins", "Stale leader steps down"],
    banner: "Partition and failover",
    whatHappens:
      "The old leader loses contact with the majority. The healthy side elects a new leader in a higher term. When connectivity returns, the old leader steps down.",
    whyMatters:
      "This is why Raft avoids split-brain commits. Temporary confusion is acceptable; conflicting committed history is not.",
    interview:
      "An isolated minority leader can continue to send heartbeats locally, but it cannot commit new entries because it cannot collect a majority.",
    caption:
      "This is the heart of split-brain prevention: temporary confusion is survivable because conflicting commits still need intersecting quorums.",
    messages: ["network split", "minority loses quorum", "higher term leader wins"],
    logs: ["[1][2][3][x?]", "[1][2][3][4*]", "[1][2][3][4*]"],
    nodes: [
      { id: "A", role: "Old leader", term: "term 8", classes: ["is-leader", "is-partitioned"] },
      { id: "B", role: "New leader", term: "term 9", classes: ["is-leader"] },
      { id: "C", role: "Follower", term: "term 9", classes: ["is-follower"] }
    ]
  },
  {
    kicker: "Scene 5",
    title: "YugabyteDB scales by running many tablet leaders.",
    simple:
      "Plain English: instead of one giant leader for the whole database, YugabyteDB splits the database into many pieces, and each piece gets its own leader.",
    description:
      "YugabyteDB does not funnel all writes through one global Raft leader. Each tablet forms its own Raft group, and leaders are spread across nodes to balance load.",
    facts: ["Tablet leaders", "Leader balancing", "Parallel write scaling"],
    banner: "Many Raft groups",
    whatHappens:
      "A table is split into tablets. Each tablet has its own leader and followers. The cluster balancer can move data and leaders to spread CPU, disk, and query load.",
    whyMatters:
      "This is what makes a leader-based design still scale horizontally. Leadership is sharded across many tablets, not centralized in one node.",
    interview:
      "In YugabyteDB, writes and leader-based coordination for a given tablet go through that tablet's leader, while cluster balancing moves leaders and peers to keep load even.",
    caption:
      "A distributed database can be leader-based and still scale horizontally when the leader role is sharded across many tablets.",
    messages: ["tablet A -> Node A", "tablet B -> Node B", "tablet C -> Node C"],
    logs: ["T1,T4 leaders", "T2 leader", "T3 leader"],
    nodes: [
      { id: "A", role: "Leads T1/T4", term: "tablet leaders", classes: ["is-leader"] },
      { id: "B", role: "Leads T2", term: "tablet leader", classes: ["is-follower", "is-busy"] },
      { id: "C", role: "Leads T3", term: "tablet leader", classes: ["is-follower", "is-busy"] }
    ]
  }
];

const sceneTabs = document.querySelectorAll(".scene-tab");
const sceneKicker = document.getElementById("scene-kicker");
const sceneTitle = document.getElementById("scene-title");
const sceneSimple = document.getElementById("scene-simple");
const sceneDescription = document.getElementById("scene-description");
const sceneFacts = document.getElementById("scene-facts");
const sceneCaption = document.getElementById("scene-caption");
const sceneBanner = document.getElementById("scene-banner");
const sceneWhatHappens = document.getElementById("scene-what-happens");
const sceneWhyMatters = document.getElementById("scene-why-matters");
const sceneInterview = document.getElementById("scene-interview");
const messageRow = document.getElementById("message-row");
const logStrip = document.getElementById("log-strip");
const labNodes = document.querySelectorAll(".lab-node");

function renderScene(index) {
  const scene = scenes[index];

  sceneTabs.forEach((tab) => {
    tab.classList.toggle("is-active", Number(tab.dataset.scene) === index);
  });

  sceneKicker.textContent = scene.kicker;
  sceneTitle.textContent = scene.title;
  sceneSimple.textContent = scene.simple;
  sceneDescription.textContent = scene.description;
  sceneCaption.textContent = scene.caption;
  sceneBanner.textContent = scene.banner;
  sceneWhatHappens.textContent = scene.whatHappens;
  sceneWhyMatters.textContent = scene.whyMatters;
  sceneInterview.textContent = scene.interview;

  sceneFacts.innerHTML = "";
  scene.facts.forEach((fact) => {
    const chip = document.createElement("span");
    chip.textContent = fact;
    sceneFacts.appendChild(chip);
  });

  messageRow.innerHTML = "";
  scene.messages.forEach((message) => {
    const chip = document.createElement("span");
    chip.textContent = message;
    messageRow.appendChild(chip);
  });

  logStrip.innerHTML = "";
  scene.logs.forEach((log, position) => {
    const box = document.createElement("div");
    const title = document.createElement("strong");
    const text = document.createElement("span");
    box.className = "log-box";
    title.textContent = `${String.fromCharCode(65 + position)} log`;
    text.textContent = log;
    box.appendChild(title);
    box.appendChild(text);
    logStrip.appendChild(box);
  });

  labNodes.forEach((node) => {
    const next = scene.nodes.find((item) => item.id === node.dataset.node);
    node.className = "lab-node";
    node.querySelector("span").textContent = next.role;
    node.querySelector("small").textContent = next.term;
    next.classes.forEach((name) => node.classList.add(name));
  });
}

sceneTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    renderScene(Number(tab.dataset.scene));
  });
});

renderScene(0);
