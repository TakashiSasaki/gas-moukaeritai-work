const RECENT_WINDOW_DAYS = 90;
const RECENT_CARD_LIMIT = 6;
const PROJECTS_URL = "/projects.json";
const REPOSITORY_URL = "https://github.com/TakashiSasaki/gas.moukaeritai.work";
const RAW_PROJECT_ROOT =
  "https://raw.githubusercontent.com/TakashiSasaki/gas.moukaeritai.work/gas.moukaeritai.work/projects";

let projects = [];
let selectedProjectId = null;

const elements = {};

function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLocaleLowerCase("ja")
    .trim();
}

function timestampValue(value) {
  if (!value) {
    return null;
  }
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function compareNullableDatesDescending(left, right) {
  const leftValue = timestampValue(left);
  const rightValue = timestampValue(right);
  if (leftValue === null && rightValue === null) {
    return 0;
  }
  if (leftValue === null) {
    return 1;
  }
  if (rightValue === null) {
    return -1;
  }
  return rightValue - leftValue;
}

function compareNames(left, right) {
  return left.name.localeCompare(right.name, ["ja", "en"], {
    sensitivity: "base",
    numeric: true,
  }) || left.id.localeCompare(right.id);
}

function formatAbsoluteDate(value) {
  const timestamp = timestampValue(value);
  if (timestamp === null) {
    return "日時不明";
  }
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(timestamp);
}

function formatRelativeDate(value) {
  const timestamp = timestampValue(value);
  if (timestamp === null) {
    return "更新日時不明";
  }

  const differenceMs = timestamp - Date.now();
  const differenceDays = Math.round(differenceMs / 86_400_000);
  const formatter = new Intl.RelativeTimeFormat("ja", { numeric: "auto" });

  if (Math.abs(differenceDays) < 1) {
    const differenceHours = Math.round(differenceMs / 3_600_000);
    if (Math.abs(differenceHours) < 1) {
      const differenceMinutes = Math.round(differenceMs / 60_000);
      return formatter.format(differenceMinutes, "minute");
    }
    return formatter.format(differenceHours, "hour");
  }
  if (Math.abs(differenceDays) < 60) {
    return formatter.format(differenceDays, "day");
  }
  const differenceMonths = Math.round(differenceDays / 30);
  if (Math.abs(differenceMonths) < 24) {
    return formatter.format(differenceMonths, "month");
  }
  const differenceYears = Math.round(differenceDays / 365);
  return formatter.format(differenceYears, "year");
}

function isWithinRecentWindow(project) {
  const updated = timestampValue(project.updatedAt);
  if (updated === null) {
    return false;
  }
  return updated >= Date.now() - RECENT_WINDOW_DAYS * 86_400_000;
}

function projectSourceUrl(project) {
  return `${REPOSITORY_URL}/tree/gas.moukaeritai.work/projects/${encodeURIComponent(project.id)}/gas`;
}

function readmeRawUrl(project) {
  return `${RAW_PROJECT_ROOT}/${encodeURIComponent(project.id)}/README.md`;
}

function createMetadataLine(project) {
  const wrapper = document.createElement("div");
  wrapper.className = "project-meta";

  const updated = document.createElement("span");
  updated.textContent = `更新 ${formatAbsoluteDate(project.updatedAt)}`;
  if (project.updatedAt) {
    updated.title = project.updatedAt;
  }
  wrapper.appendChild(updated);

  const created = document.createElement("span");
  created.textContent = `作成 ${formatAbsoluteDate(project.createdAt)}`;
  if (project.createdAt) {
    created.title = project.createdAt;
  }
  wrapper.appendChild(created);

  return wrapper;
}

function createProjectButton(project, className = "project-row") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.classList.toggle("is-selected", project.id === selectedProjectId);
  button.dataset.projectId = project.id;
  button.setAttribute("aria-pressed", String(project.id === selectedProjectId));

  const heading = document.createElement("span");
  heading.className = "project-row-title";
  heading.textContent = project.name;
  button.appendChild(heading);

  button.appendChild(createMetadataLine(project));

  const badges = document.createElement("span");
  badges.className = "project-badges";
  if (project.hasReadme === true) {
    const readmeBadge = document.createElement("span");
    readmeBadge.className = "badge text-bg-light border";
    readmeBadge.textContent = "README";
    badges.appendChild(readmeBadge);
  }
  button.appendChild(badges);

  return button;
}

function renderRecentProjects() {
  elements.recentProjects.replaceChildren();

  const recent = projects
    .filter((project) => timestampValue(project.updatedAt) !== null)
    .sort((left, right) =>
      compareNullableDatesDescending(left.updatedAt, right.updatedAt) || compareNames(left, right)
    )
    .slice(0, RECENT_CARD_LIMIT);

  if (!recent.length) {
    const empty = document.createElement("p");
    empty.className = "text-secondary mb-0";
    empty.textContent = "更新日時を取得できるプロジェクトがありません。";
    elements.recentProjects.appendChild(empty);
    return;
  }

  recent.forEach((project) => {
    const column = document.createElement("div");
    column.className = "col-md-6 col-xl-4";

    const card = document.createElement("button");
    card.type = "button";
    card.className = "recent-project card h-100 w-100 text-start border-0 shadow-sm";
    card.dataset.projectId = project.id;
    card.setAttribute("aria-pressed", String(project.id === selectedProjectId));

    const body = document.createElement("span");
    body.className = "card-body d-block";

    const relative = document.createElement("span");
    relative.className = "small text-success-emphasis fw-semibold d-block mb-2";
    relative.textContent = formatRelativeDate(project.updatedAt);
    body.appendChild(relative);

    const name = document.createElement("span");
    name.className = "h6 d-block mb-2";
    name.textContent = project.name;
    body.appendChild(name);

    const date = document.createElement("span");
    date.className = "small text-secondary d-block";
    date.textContent = `更新 ${formatAbsoluteDate(project.updatedAt)}`;
    body.appendChild(date);

    card.appendChild(body);
    column.appendChild(card);
    elements.recentProjects.appendChild(column);
  });
}

function currentVisibleProjects() {
  const search = normalizeSearchText(elements.search.value);
  const filter = elements.filter.value;
  const sort = elements.sort.value;

  const visible = projects.filter((project) => {
    if (search && !normalizeSearchText(project.name).includes(search)) {
      return false;
    }
    if (filter === "recent90" && !isWithinRecentWindow(project)) {
      return false;
    }
    return true;
  });

  visible.sort((left, right) => {
    if (sort === "name") {
      return compareNames(left, right);
    }
    if (sort === "created") {
      return compareNullableDatesDescending(left.createdAt, right.createdAt) || compareNames(left, right);
    }
    return compareNullableDatesDescending(left.updatedAt, right.updatedAt) || compareNames(left, right);
  });

  return visible;
}

function renderProjectList() {
  const visible = currentVisibleProjects();
  elements.projectList.replaceChildren();
  elements.resultCount.textContent = `${visible.length} / ${projects.length} projects`;

  if (!visible.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "条件に一致するプロジェクトがありません。";
    elements.projectList.appendChild(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  visible.forEach((project) => {
    fragment.appendChild(createProjectButton(project));
  });
  elements.projectList.appendChild(fragment);
}

function renderDetailShell(project) {
  elements.detail.replaceChildren();

  const body = document.createElement("div");
  body.className = "card-body p-4";

  const eyebrow = document.createElement("p");
  eyebrow.className = "text-uppercase small text-secondary fw-semibold mb-2";
  eyebrow.textContent = "Google Apps Script project";
  body.appendChild(eyebrow);

  const title = document.createElement("h2");
  title.className = "h3 mb-3";
  title.textContent = project.name;
  body.appendChild(title);

  body.appendChild(createMetadataLine(project));

  const actions = document.createElement("div");
  actions.className = "d-flex flex-wrap gap-2 my-4";

  const sourceLink = document.createElement("a");
  sourceLink.className = "btn btn-outline-secondary btn-sm";
  sourceLink.href = projectSourceUrl(project);
  sourceLink.target = "_blank";
  sourceLink.rel = "noopener";
  sourceLink.textContent = "GAS source";
  actions.appendChild(sourceLink);

  if (project.hasReadme !== false) {
    const rawLink = document.createElement("a");
    rawLink.className = "btn btn-outline-secondary btn-sm";
    rawLink.href = readmeRawUrl(project);
    rawLink.target = "_blank";
    rawLink.rel = "noopener";
    rawLink.textContent = "README raw";
    actions.appendChild(rawLink);
  }

  body.appendChild(actions);

  const divider = document.createElement("hr");
  body.appendChild(divider);

  const readmeHeading = document.createElement("h3");
  readmeHeading.className = "h5 mt-4";
  readmeHeading.textContent = "README";
  body.appendChild(readmeHeading);

  const readme = document.createElement("div");
  readme.id = "readme-content";
  readme.className = "readme-content";
  if (project.hasReadme !== false) {
    const loading = document.createElement("p");
    loading.className = "text-secondary";
    loading.textContent = "READMEを読み込んでいます...";
    readme.appendChild(loading);
  } else {
    const missing = document.createElement("p");
    missing.className = "text-secondary";
    missing.textContent = "このプロジェクトにはREADME.mdがありません。";
    readme.appendChild(missing);
  }
  body.appendChild(readme);

  elements.detail.appendChild(body);
  return readme;
}

async function loadReadme(project, readmeElement) {
  if (project.hasReadme === false) {
    return;
  }

  try {
    const response = await fetch(readmeRawUrl(project));
    if (!response.ok) {
      throw new Error(`README request failed: ${response.status}`);
    }
    const markdown = await response.text();

    if (window.marked && window.DOMPurify) {
      const rendered = window.marked.parse(markdown);
      readmeElement.innerHTML = window.DOMPurify.sanitize(rendered);
    } else {
      const fallback = document.createElement("pre");
      fallback.className = "markdown-fallback";
      fallback.textContent = markdown;
      readmeElement.replaceChildren(fallback);
    }
  } catch (error) {
    console.error("README load failed:", error);
    const message = document.createElement("p");
    message.className = "text-danger";
    message.textContent = "READMEを読み込めませんでした。GAS source から直接確認してください。";
    readmeElement.replaceChildren(message);
  }
}

function updateProjectUrl(projectId, replace = false) {
  const url = new URL(window.location.href);
  if (projectId) {
    url.searchParams.set("project", projectId);
  } else {
    url.searchParams.delete("project");
  }
  const method = replace ? "replaceState" : "pushState";
  history[method]({ project: projectId }, "", url);
}

function refreshSelectedStyles() {
  document.querySelectorAll("[data-project-id]").forEach((element) => {
    const selected = element.dataset.projectId === selectedProjectId;
    element.classList.toggle("is-selected", selected);
    element.setAttribute("aria-pressed", String(selected));
  });
}

function selectProject(projectId, options = {}) {
  const project = projects.find((item) => item.id === projectId);
  if (!project) {
    const body = document.createElement("div");
    body.className = "card-body p-4";
    const message = document.createElement("p");
    message.className = "text-danger mb-0";
    message.textContent = "指定されたプロジェクトは現在の公開一覧にありません。";
    body.appendChild(message);
    elements.detail.replaceChildren(body);
    selectedProjectId = null;
    refreshSelectedStyles();
    return;
  }

  selectedProjectId = project.id;
  if (options.updateUrl !== false) {
    updateProjectUrl(project.id, options.replaceUrl === true);
  }

  const readmeElement = renderDetailShell(project);
  refreshSelectedStyles();
  loadReadme(project, readmeElement);

  if (options.scrollIntoView) {
    elements.detail.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function handleProjectActivation(event) {
  const target = event.target.closest("[data-project-id]");
  if (!target) {
    return;
  }
  selectProject(target.dataset.projectId, {
    updateUrl: true,
    scrollIntoView: window.matchMedia("(max-width: 991.98px)").matches,
  });
}

async function loadProjects() {
  try {
    const response = await fetch(PROJECTS_URL, { cache: "no-cache" });
    if (!response.ok) {
      throw new Error(`Project index request failed: ${response.status}`);
    }
    const payload = await response.json();
    if (!Array.isArray(payload)) {
      throw new Error("Project index must be an array");
    }

    projects = payload
      .filter((project) => project && typeof project.id === "string" && typeof project.name === "string")
      .map((project) => ({
        id: project.id,
        name: project.name,
        createdAt: typeof project.createdAt === "string" ? project.createdAt : null,
        updatedAt: typeof project.updatedAt === "string" ? project.updatedAt : null,
        hasReadme: typeof project.hasReadme === "boolean" ? project.hasReadme : null,
      }));

    elements.total.textContent = String(projects.length);
    renderRecentProjects();
    renderProjectList();

    const requestedProject = new URL(window.location.href).searchParams.get("project");
    if (requestedProject) {
      selectProject(requestedProject, { updateUrl: false });
    }
  } catch (error) {
    console.error("Project index load failed:", error);
    elements.resultCount.textContent = "プロジェクト一覧を読み込めませんでした。";
    elements.projectList.replaceChildren();
    const errorMessage = document.createElement("div");
    errorMessage.className = "alert alert-danger";
    errorMessage.textContent = "プロジェクト一覧を読み込めませんでした。";
    elements.projectList.appendChild(errorMessage);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  elements.total = document.getElementById("project-total-value");
  elements.recentProjects = document.getElementById("recent-projects");
  elements.resultCount = document.getElementById("result-count");
  elements.search = document.getElementById("project-search");
  elements.filter = document.getElementById("project-filter");
  elements.sort = document.getElementById("project-sort");
  elements.projectList = document.getElementById("project-list");
  elements.detail = document.getElementById("project-detail");

  elements.search.addEventListener("input", renderProjectList);
  elements.filter.addEventListener("change", renderProjectList);
  elements.sort.addEventListener("change", renderProjectList);
  elements.projectList.addEventListener("click", handleProjectActivation);
  elements.recentProjects.addEventListener("click", handleProjectActivation);

  window.addEventListener("popstate", () => {
    const requestedProject = new URL(window.location.href).searchParams.get("project");
    if (requestedProject) {
      selectProject(requestedProject, { updateUrl: false });
    } else {
      selectedProjectId = null;
      refreshSelectedStyles();
      const body = document.createElement("div");
      body.className = "card-body p-4";
      const message = document.createElement("p");
      message.className = "text-secondary mb-0";
      message.textContent = "左の一覧からプロジェクトを選択してください。";
      body.appendChild(message);
      elements.detail.replaceChildren(body);
    }
  });

  loadProjects();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.log("ServiceWorker registration failed:", error);
    });
  });
}