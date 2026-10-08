(() => {
  function toast(msg) {
    let el = document.querySelector(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("show"), 2400);
  }

  document.querySelectorAll("[data-toast]").forEach((btn) => {
    btn.addEventListener("click", () => toast(btn.getAttribute("data-toast")));
  });

  document.querySelectorAll(".filter").forEach((btn) => {
    btn.addEventListener("click", () => {
      const group = btn.parentElement;
      group.querySelectorAll(".filter").forEach((f) => f.classList.remove("active"));
      btn.classList.add("active");
      toast(btn.textContent.trim());
    });
  });

  document.querySelectorAll(".filter-select").forEach((select) => {
    select.addEventListener("change", () => {
      select.classList.toggle("on", select.selectedIndex > 0);
      toast(select.options[select.selectedIndex].text);
    });
  });

  document.querySelectorAll(".subtype, .pick").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.parentElement.querySelectorAll(".subtype, .pick").forEach((s) => s.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  /* ——— Notifications popup ——— */
  const bell = document.querySelector("[data-notif]");
  const pop = document.querySelector(".notif-pop");
  if (bell && pop) {
    const close = () => {
      pop.hidden = true;
      bell.setAttribute("aria-expanded", "false");
    };
    bell.addEventListener("click", (e) => {
      e.stopPropagation();
      pop.hidden = !pop.hidden;
      bell.setAttribute("aria-expanded", String(!pop.hidden));
    });
    pop.addEventListener("click", (e) => e.stopPropagation());
    document.addEventListener("click", close);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
    const markAll = pop.querySelector("[data-mark-read]");
    if (markAll) {
      markAll.addEventListener("click", () => {
        bell.classList.add("read");
        toast("Все уведомления отмечены прочитанными");
        close();
      });
    }
  }

  /* ——— Disclosure: заявки внутри объекта, чат внутри запроса ——— */
  document.querySelectorAll("[data-disclosure]").forEach((btn) => {
    const body = document.getElementById(btn.getAttribute("data-disclosure"));
    if (!body) return;
    btn.setAttribute("aria-expanded", String(!body.hidden));
    btn.addEventListener("click", () => {
      body.hidden = !body.hidden;
      btn.setAttribute("aria-expanded", String(!body.hidden));
    });
  });

  document.querySelectorAll(".req-card").forEach((card) => {
    const head = card.querySelector(".req-head");
    const body = card.querySelector(".req-body");
    if (!head || !body) return;
    const setOpen = (open) => {
      body.hidden = !open;
      card.classList.toggle("open", open);
      head.setAttribute("aria-expanded", String(open));
    };
    setOpen(false);
    head.addEventListener("click", () => setOpen(body.hidden));
    const back = body.querySelector("[data-collapse]");
    if (back) {
      back.addEventListener("click", () => {
        setOpen(false);
        card.scrollIntoView({ block: "nearest" });
      });
    }
  });

  /* ——— Modal ——— */
  const openModal = (id) => {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  };
  const closeModals = () => {
    document.querySelectorAll(".modal").forEach((m) => (m.hidden = true));
    document.body.style.overflow = "";
  };

  document.querySelectorAll("[data-modal]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const id = trigger.getAttribute("data-modal");
      const modal = document.getElementById(id);
      if (modal) {
        ["title", "meta", "text"].forEach((key) => {
          const node = modal.querySelector("[data-fill-" + key + "]");
          if (node && trigger.dataset[key]) node.textContent = trigger.dataset[key];
        });
        const img = modal.querySelector("[data-fill-image]");
        if (img) {
          if (trigger.dataset.image) {
            img.src = trigger.dataset.image;
            img.alt = trigger.dataset.title || "";
            img.hidden = false;
          } else {
            img.removeAttribute("src");
            img.hidden = true;
          }
        }
        const form = modal.querySelector("[data-svc-form]");
        if (form) {
          form.dataset.toast = trigger.getAttribute("data-toast") || "Заявка отправлена";
          fillSvcRequestForm(form);
        }
      }
      openModal(id);
    });
  });

  const defaultContacts = [
    { id: "nikitin", name: "Никитин Михаил", phone: "+7 (925) 555-34-12", email: "m.nikitin@mail.ru" },
    { id: "smirnov", name: "Алексей Смирнов", phone: "+7 (926) 111-22-33", email: "a.smirnov@sever-sys.ru" },
    { id: "orlova", name: "Евгения Орлова", phone: "+7 (903) 444-55-66", email: "e.orlova@sever-sys.ru" }
  ];

  const svcContacts = () => (window.LK && LK.contacts && LK.contacts.length ? LK.contacts : defaultContacts);

  const fillSvcRequestForm = (form) => {
    const list = svcContacts();
    const select = form.querySelector("[data-svc-contact]");
    const phone = form.querySelector("[data-svc-phone]");
    const email = form.querySelector("[data-svc-email]");
    const comment = form.querySelector("[data-svc-comment]");
    const org = window.LK && LK.org
      ? LK.org
      : {
          name: "ООО «Северные системы»",
          inn: "7701234567 / 770101001",
          contract: "№ 488-АР от 01.03.2025"
        };

    const orgName = form.querySelector("[data-svc-org-name]");
    const orgInn = form.querySelector("[data-svc-org-inn]");
    const orgContract = form.querySelector("[data-svc-org-contract]");
    if (orgName) orgName.textContent = org.name;
    if (orgInn) orgInn.textContent = org.inn;
    if (orgContract) orgContract.textContent = org.contract;

    if (!select) return;

    select.innerHTML = list
      .map((c, i) => '<option value="' + c.id + '"' + (i === 0 ? " selected" : "") + ">" + c.name + "</option>")
      .join("");

    const apply = () => {
      const contact = list.find((c) => c.id === select.value) || list[0];
      if (!contact) return;
      if (phone) phone.value = contact.phone || "";
      if (email) email.value = contact.email || "";
    };

    select.onchange = apply;
    apply();
    if (comment) comment.value = "";
  };

  document.querySelectorAll("[data-svc-form]").forEach((form) => {
    fillSvcRequestForm(form);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const phone = form.querySelector("[data-svc-phone]");
      const email = form.querySelector("[data-svc-email]");
      if (!phone || !phone.value.trim()) {
        toast("Укажите телефон для обратной связи");
        return;
      }
      if (!email || !email.value.trim()) {
        toast("Укажите e-mail для обратной связи");
        return;
      }
      toast(form.dataset.toast || "Заявка отправлена. Менеджер свяжется по указанным контактам.");
      closeModals();
    });
  });

  /* Профиль: переключение физлицо / юрлицо */
  const profileTabs = document.querySelector("[data-profile-tabs]");
  if (profileTabs) {
    profileTabs.querySelectorAll("[data-profile-tab]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tab = btn.getAttribute("data-profile-tab");
        profileTabs.querySelectorAll("[data-profile-tab]").forEach((b) => b.classList.toggle("active", b === btn));
        document.querySelectorAll("[data-profile-panel]").forEach((panel) => {
          panel.hidden = panel.getAttribute("data-profile-panel") !== tab;
        });
      });
    });
  }

  /* Телефон УК: выпадающий список с добавочными */
  const phonePop = document.querySelector("[data-phone-pop]");
  if (phonePop) {
    const toggle = phonePop.querySelector("[data-phone-toggle]");
    const menu = phonePop.querySelector("[data-phone-menu]");
    const setOpen = (open) => {
      if (!menu || !toggle) return;
      menu.hidden = !open;
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    };
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      setOpen(menu.hidden);
    });
    document.addEventListener("click", (e) => {
      if (!phonePop.contains(e.target)) setOpen(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });
  }

  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal || e.target.closest("[data-close]")) closeModals();
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModals();
  });

  /* ——— Квиз создания запроса: объект → категория → услуга → детали ——— */
  const quiz = document.querySelector("#quiz");
  if (quiz && window.LK) {
    const steps = [...quiz.querySelectorAll(".quiz-step")];
    const dots = [...document.querySelectorAll(".step-dot")];
    const state = { object: null, category: null, service: null };
    let current = 0;
    const contentBcMap = { alpha: "alpha", omega: "omega", sigma: "alpha", delta: "omega", vega: "omega", park: "alpha" };
    const readBc = () => {
      try {
        return localStorage.getItem("lk-active-bc") || "alpha";
      } catch (e) {
        return "alpha";
      }
    };
    const activeContentBc = contentBcMap[readBc()] || "alpha";

    const grid = (name) => quiz.querySelector('[data-picks="' + name + '"]');

    const pick = (title, note, value) =>
      '<button class="pick" type="button" data-value="' + value + '"><span>' +
      title + (note ? "<small>" + note + "</small>" : "") + "</span></button>";

    const bind = (name, onPick) => {
      const box = grid(name);
      box.querySelectorAll(".pick").forEach((btn) => {
        btn.addEventListener("click", () => {
          box.querySelectorAll(".pick").forEach((p) => p.classList.remove("active"));
          btn.classList.add("active");
          onPick(btn.dataset.value);
        });
      });
    };

    const isParkingOnly = (objectId) => {
      const obj = LK.objects[objectId];
      return !!(obj && obj.kind === "Машиноместо");
    };

    const serviceAllowedForObject = (svc, objectId) => {
      if (!svc) return false;
      if (svc.officeOnly && isParkingOnly(objectId)) return false;
      return true;
    };

    const serviceById = (id) => {
      for (const cat of LK.services) {
        const hit = cat.items.find((s) => s.id === id);
        if (hit) return { cat, svc: hit };
      }
      return null;
    };

    const contactPickerHtml = () => {
      const list = LK.contacts || [];
      if (!list.length) return "";
      return (
        '<div class="field-label">Кто оставляет заявку</div>' +
        '<label class="field"><select data-contact-pick>' +
        list
          .map((c, i) => '<option value="' + c.id + '"' + (i === 0 ? " selected" : "") + ">" + c.name + " · " + c.phone + "</option>")
          .join("") +
        '</select></label><p class="hint" style="margin:-4px 0 12px">Выберите контакт из профиля или введите номер вручную ниже.</p>'
      );
    };

    const field = (f) => {
      const label = '<div class="field-label">' + f.label + "</div>";
      if (f.type === "select") {
        return label + '<label class="field"><select>' +
          f.options.map((o) => "<option>" + o + "</option>").join("") + "</select></label>";
      }
      if (f.type === "yesno") {
        return (
          label +
          '<label class="field"><select>' +
          "<option>Нет</option><option>Да</option>" +
          "</select></label>"
        );
      }
      if (f.type === "checks") {
        return (
          label +
          '<div class="check-grid">' +
          (f.options || [])
            .map(
              (o) =>
                '<label class="check-item"><input type="checkbox" /><span>' +
                o +
                "</span></label>"
            )
            .join("") +
          "</div>"
        );
      }
      if (f.type === "table") {
        const cols = f.columns || [];
        const rows = f.rows || 3;
        const head =
          "<thead><tr>" +
          cols.map((c) => "<th>" + c.label + "</th>").join("") +
          "</tr></thead>";
        const bodyRows = Array.from({ length: rows }, () => {
          const cells = cols
            .map((c) => {
              if (c.type === "select") {
                return (
                  "<td><select>" +
                  (c.options || []).map((o) => "<option>" + o + "</option>").join("") +
                  "</select></td>"
                );
              }
              return (
                '<td><input type="text" placeholder="' +
                (c.placeholder || "") +
                '" /></td>'
              );
            })
            .join("");
          return "<tr>" + cells + "</tr>";
        }).join("");
        return (
          label +
          '<div class="form-table-wrap"><table class="form-table">' +
          head +
          "<tbody>" +
          bodyRows +
          "</tbody></table></div>"
        );
      }
      if (f.type === "textarea") {
        return label + '<label class="field"><textarea rows="3" placeholder="' + (f.placeholder || "") + '"></textarea></label>';
      }
      if (f.type === "file") {
        return label + '<div class="file-box">Прикрепить PDF / Word / фото<br /><input type="file" style="margin-top:8px" /></div>';
      }
      const extra = f.type === "tel" ? ' data-contact-phone' : "";
      return label + '<label class="field"><input type="' + (f.type || "text") + '"' + extra + ' placeholder="' + (f.placeholder || "") + '" /></label>';
    };

    const bindContactPick = () => {
      const select = quiz.querySelector("[data-contact-pick]");
      if (!select || !LK.contacts) return;
      const apply = () => {
        const contact = LK.contacts.find((c) => c.id === select.value);
        if (!contact) return;
        const phoneInput = quiz.querySelector("[data-contact-phone]");
        if (phoneInput) phoneInput.value = contact.phone;
      };
      select.addEventListener("change", apply);
      apply();
    };

    const objectsForBc = LK.objectOrder.filter((id) => {
      const obj = LK.objects[id];
      return obj && (obj.bc || "alpha") === activeContentBc;
    });
    const objectIds = objectsForBc.length ? objectsForBc : LK.objectOrder;

    grid("object").innerHTML = objectIds
      .map((id) => pick(LK.objects[id].title, LK.objects[id].address + " · " + LK.objects[id].floor, id))
      .join("");
    bind("object", (v) => {
      state.object = v;
      if (state.service) {
        const foundSvc = serviceById(state.service);
        if (!foundSvc || !serviceAllowedForObject(foundSvc.svc, v)) {
          state.service = null;
          state.category = null;
        }
      }
      renderCategories();
      if (state.category) renderServices();
    });
    grid("object").querySelector(".pick").classList.add("active");
    state.object = objectIds[0];

    const objectPreset = new URLSearchParams(location.search).get("object");
    if (objectPreset && LK.objects[objectPreset] && objectIds.includes(objectPreset)) {
      state.object = objectPreset;
      grid("object").querySelectorAll(".pick").forEach((p) => p.classList.remove("active"));
      const objBtn = grid("object").querySelector('.pick[data-value="' + objectPreset + '"]');
      if (objBtn) objBtn.classList.add("active");
    }

    const plural = (n, forms) => {
      const mod10 = n % 10;
      const mod100 = n % 100;
      if (mod10 === 1 && mod100 !== 11) return forms[0];
      if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
      return forms[2];
    };

    function renderCategories() {
      const cats = LK.services
        .map((c) => {
          const items = c.items.filter((s) => serviceAllowedForObject(s, state.object));
          return items.length ? { ...c, items } : null;
        })
        .filter(Boolean);
      grid("category").innerHTML = cats
        .map((c) => pick(c.title, c.items.length + " " + plural(c.items.length, ["вид", "вида", "видов"]) + " заявок", c.id))
        .join("");
      bind("category", (v) => {
        if (state.category !== v) state.service = null;
        state.category = v;
        renderServices();
      });
      if (state.category) {
        const active = grid("category").querySelector('.pick[data-value="' + state.category + '"]');
        if (active) active.classList.add("active");
        else {
          state.category = null;
          state.service = null;
        }
      }
      if (isParkingOnly(state.object)) {
        const hint = quiz.querySelector("[data-preset-hint]");
        if (hint && !hint.dataset.locked) {
          hint.textContent = "Для машиноместа недоступны заявки на внос ТМЦ и строительные работы — выберите офис или оформите пропуск.";
          hint.hidden = false;
        }
      } else {
        const hint = quiz.querySelector("[data-preset-hint]");
        if (hint && !hint.dataset.locked) {
          hint.hidden = true;
        }
      }
    }

    function renderServices() {
      const cat = LK.services.find((c) => c.id === state.category);
      const items = cat ? cat.items.filter((s) => serviceAllowedForObject(s, state.object)) : [];
      grid("service").innerHTML = items.map((s) => pick(s.title, s.note, s.id)).join("");
      bind("service", (v) => {
        state.service = v;
        renderDetails();
      });
      if (state.service) {
        const active = grid("service").querySelector('.pick[data-value="' + state.service + '"]');
        if (active) active.classList.add("active");
        else state.service = null;
      }
    }

    renderCategories();

    function renderDetails() {
      const found = serviceById(state.service);
      if (!found) return;
      const { cat, svc } = found;

      quiz.querySelector("[data-summary]").innerHTML =
        "<span>" + LK.objects[state.object].title + " · " + cat.title + "</span><span>" + svc.title + "</span>";

      const subBox = quiz.querySelector("[data-subcats]");
      const subRow = grid("option");
      if (svc.options && svc.options.length) {
        subRow.innerHTML = svc.options
          .map((o, i) => '<button class="subtype' + (i === 0 ? " active" : "") + '" type="button">' + o + "</button>")
          .join("");
        subRow.querySelectorAll(".subtype").forEach((btn) => {
          btn.addEventListener("click", () => {
            subRow.querySelectorAll(".subtype").forEach((s) => s.classList.remove("active"));
            btn.classList.add("active");
          });
        });
        subBox.hidden = false;
      } else {
        subBox.hidden = true;
      }

      quiz.querySelector("[data-fields]").innerHTML =
        contactPickerHtml() + (svc.fields || []).map(field).join("");
      bindContactPick();

      const hint = quiz.querySelector("[data-service-hint]");
      hint.textContent = svc.hint || "";
      hint.hidden = !svc.hint;

      quiz.querySelector("[data-rules-text]").textContent =
        svc.rules || "Заявка уходит исполнителю УК. Статус и переписка — в разделе «Мои запросы».";
    }

    const render = () => {
      steps.forEach((s, i) => (s.hidden = i !== current));
      dots.forEach((d, i) => d.classList.toggle("on", i <= current));
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const presetId = LK.presets[new URLSearchParams(location.search).get("type")];
    let presetHit = presetId && serviceById(presetId);
    if (presetHit && !serviceAllowedForObject(presetHit.svc, state.object)) {
      toast("Эта заявка недоступна для машиноместа. Выберите офис.");
      presetHit = null;
      const hint = quiz.querySelector("[data-preset-hint]");
      if (hint) {
        hint.textContent = "Выбранная с главной заявка недоступна для машиноместа. Выберите офис или другой тип запроса.";
        hint.hidden = false;
        hint.dataset.locked = "1";
      }
    }

    quiz.querySelectorAll("[data-next]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const box = steps[current].querySelector(".pick-grid");
        if (box && !box.querySelector(".pick.active")) {
          toast("Выберите вариант, чтобы продолжить");
          return;
        }
        if (presetHit && current === 0) {
          if (!serviceAllowedForObject(presetHit.svc, state.object)) {
            toast("Эта заявка недоступна для машиноместа. Выберите офис.");
            return;
          }
          current = 3;
        } else {
          current = Math.min(current + 1, steps.length - 1);
        }
        render();
      });
    });

    quiz.querySelectorAll("[data-prev]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (presetHit && current === 3) {
          current = 0;
        } else {
          current = Math.max(current - 1, 0);
        }
        render();
      });
    });

    if (presetHit) {
      state.category = presetHit.cat.id;
      state.service = presetHit.svc.id;
      const catBtn = grid("category").querySelector('.pick[data-value="' + state.category + '"]');
      if (catBtn) catBtn.classList.add("active");
      renderServices();
      renderDetails();
      const hint = quiz.querySelector("[data-preset-hint]");
      hint.textContent = "С главной выбрано: " + presetHit.cat.title + " → " + presetHit.svc.title + ". После объекта — сразу форма заявки.";
      hint.hidden = false;
      hint.dataset.locked = "1";
    }

    render();

    quiz.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!state.service) {
        toast("Выберите услугу");
        return;
      }
      if (!serviceAllowedForObject(serviceById(state.service).svc, state.object)) {
        toast("Эта заявка недоступна для машиноместа");
        return;
      }
      const ok = quiz.querySelector("#rules-check");
      if (ok && !ok.checked) {
        toast("Отметьте ознакомление с правилами");
        return;
      }
      const paid = quiz.querySelector("#paid-check");
      if (paid && !paid.checked) {
        toast("Отметьте ознакомление с условиями платных услуг");
        return;
      }
      toast("Запрос отправлен");
      setTimeout(() => {
        location.href = "requests.html";
      }, 700);
    });
  }

  /* ——— Кнопка «Назад» в деталях ——— */
  document.querySelectorAll("[data-back]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      if (history.length > 1 && document.referrer.startsWith(location.origin)) {
        e.preventDefault();
        history.back();
      }
    });
  });

  /* ——— Карточка объекта и карточка запроса ——— */
  const param = (key) => new URLSearchParams(location.search).get(key);
  const statusTag = (key) => {
    const s = (window.LK && LK.statuses[key]) || { label: key, cls: "status-grey" };
    return '<span class="status ' + s.cls + '">' + s.label + "</span>";
  };
  const row = (dt, dd) => '<div class="kv-row"><dt>' + dt + "</dt><dd>" + dd + "</dd></div>";

  const objectPage = document.querySelector("[data-object-page]");
  if (objectPage && window.LK) {
    const id = LK.objects[param("id")] ? param("id") : "142";
    const obj = LK.objects[id];

    document.title = obj.title + " — Личный кабинет";
    objectPage.querySelectorAll("[data-obj-title]").forEach((n) => (n.textContent = obj.title));
    objectPage.querySelector("[data-obj-kv]").innerHTML =
      row("Тип объекта", obj.kind) +
      row("Адрес", obj.address) +
      row(obj.kind === "Машиноместо" ? "Расположение" : "Этаж", obj.floor) +
      (obj.area === "—" ? "" : row("Площадь", obj.area)) +
      row("Основание", obj.contract);

    const list = objectPage.querySelector("[data-obj-requests]");
    objectPage.querySelector("[data-obj-count]").textContent = obj.requests.length;
    list.innerHTML = obj.requests.length
      ? obj.requests
          .map((rid) => {
            const r = LK.requests[rid];
            const dates = r.finished
              ? "Создан " + r.created.split(",")[0] + " · Завершён " + r.finished.split(",")[0]
              : "Создан " + r.created.split(",")[0];
            return (
              '<a class="req-line" href="request.html?id=' + rid + '"><span><strong>' +
              r.title + " · №" + rid + "</strong><span class=\"date\">" + dates + "</span></span>" +
              statusTag(r.status) + "</a>"
            );
          })
          .join("")
      : '<p class="hint">По этому объекту заявок ещё не было.</p>';
  }

  const requestPage = document.querySelector("[data-request-page]");
  if (requestPage && window.LK) {
    const id = LK.requests[param("id")] ? param("id") : "108";
    const req = LK.requests[id];
    const obj = LK.objects[req.object];

    document.title = req.title + " · №" + id + " — Личный кабинет";
    requestPage.querySelector("[data-req-crumb]").textContent = "№" + id;
    requestPage.querySelector("[data-req-title]").textContent = req.title + " · №" + id;
    requestPage.querySelector("[data-req-status]").innerHTML = statusTag(req.status);
    requestPage.querySelector("[data-req-kv]").innerHTML =
      row("Объект", '<a class="link" href="object.html?id=' + req.object + '">' + obj.title + "</a>") +
      row("Тип заявки", req.type) +
      row("Создан", req.created) +
      row("Завершён", req.finished || "—") +
      row("Исполнитель", req.executor);
    requestPage.querySelector("[data-req-desc]").textContent = req.description;
    requestPage.querySelector("[data-req-chat]").innerHTML = req.chat
      .map(
        (m) =>
          '<div class="bubble' + (m.me ? " me" : "") + '"><b>' + m.who + "</b><span>" + m.text + "</span></div>"
      )
      .join("");

    const attachBlock = requestPage.querySelector("[data-req-attach-block]");
    if (req.attachment) {
      attachBlock.querySelector("[data-attach-name]").textContent = req.attachment.name;
      attachBlock.querySelector("[data-attach-meta]").textContent = req.attachment.meta;
    } else {
      attachBlock.hidden = true;
    }
  }

  /* ——— Выбор БЦ на главной: новости, объекты, ссылки на заявки ——— */
  const bcSwitch = document.querySelector("[data-bc-switch]");
  if (bcSwitch) {
    const newsBox = document.querySelector("[data-bc-news]");
    const objBox = document.querySelector("[data-bc-objects]");
    const hint = document.querySelector("[data-bc-news-hint]");
    const objLabel = document.querySelector("[data-bc-objects-label]");
    const bcSelect = bcSwitch.querySelector("[data-bc-select]");
    const labels = {
      alpha: "БЦ «Альфа»",
      omega: "БЦ «Омега»",
      sigma: "БЦ «Сигма»",
      delta: "БЦ «Дельта»",
      vega: "БЦ «Вега»",
      park: "БЦ «Парк»"
    };
    const contentBc = { alpha: "alpha", omega: "omega", sigma: "alpha", delta: "omega", vega: "omega", park: "alpha" };
    const defaultObject = { alpha: "142", omega: "102", sigma: "142", delta: "102", vega: "102", park: "142" };

    const withObjectParam = (href, objectId) => {
      try {
        const u = new URL(href, location.href);
        u.searchParams.set("object", objectId);
        return u.pathname.split("/").pop() + u.search;
      } catch (e) {
        return href;
      }
    };

    const contactsBox = document.querySelector("[data-bc-contacts]");
    const contactsLabel = document.querySelector("[data-bc-contacts-label]");
    const phonePopRoot = document.querySelector("[data-phone-pop]");
    const phoneLabel = document.querySelector("[data-bc-phone-label]");
    const phoneMain = document.querySelector("[data-phone-main]");
    const phoneMainLabel = document.querySelector("[data-bc-phone-main-label]");
    const phoneBook = {
      alpha: {
        main: { tel: "+74950001122", label: "+7 (495) 000-11-22" },
        manage: { tel: "+74950001122", label: "+7 (495) 000-11-22" },
        desk: { tel: "+74950001123", label: "+7 (495) 000-11-23" },
        sec: { tel: "+74950001124", label: "+7 (495) 000-11-24" }
      },
      omega: {
        main: { tel: "+78462123010", label: "+7 (846) 212-30-10" },
        manage: { tel: "+78462123010", label: "+7 (846) 212-30-10" },
        desk: { tel: "+78462123456", label: "+7 (846) 212-34-56" },
        sec: { tel: "+78462123011", label: "+7 (846) 212-30-11" }
      }
    };

    const applyBc = (bc) => {
      const source = contentBc[bc] || bc;
      if (bcSelect) bcSelect.value = bc;
      bcSwitch.querySelectorAll("[data-bc]").forEach((b) => b.classList.toggle("active", b.dataset.bc === bc));
      if (newsBox) {
        newsBox.querySelectorAll("[data-bc]").forEach((card) => {
          card.hidden = card.dataset.bc !== source;
        });
        newsBox.scrollLeft = 0;
        if (typeof window.lkNewsScrollerSync === "function") {
          requestAnimationFrame(() => window.lkNewsScrollerSync());
        }
      }
      if (objBox) {
        objBox.querySelectorAll("[data-bc]").forEach((row) => {
          row.hidden = row.dataset.bc !== source;
        });
      }
      if (contactsBox) {
        contactsBox.querySelectorAll(".contact-card[data-bc]").forEach((card) => {
          card.hidden = card.dataset.bc !== source;
        });
      }
      if (window.lkAdStrip && typeof window.lkAdStrip.setBc === "function") {
        window.lkAdStrip.setBc(source);
      }
      if (hint) {
        hint.textContent = "Новости и объекты показаны для " + (labels[bc] || bc) + ".";
      }
      if (objLabel) {
        objLabel.textContent = "· " + (labels[bc] || bc);
      }
      if (contactsLabel) {
        contactsLabel.textContent = "· " + (labels[bc] || bc);
      }
      const phones = phoneBook[source] || phoneBook.alpha;
      if (phoneLabel) phoneLabel.textContent = phones.main.label;
      if (phoneMain) phoneMain.setAttribute("href", "tel:" + phones.main.tel);
      if (phoneMainLabel) phoneMainLabel.textContent = phones.main.label;
      if (phonePopRoot) {
        phonePopRoot.querySelectorAll("[data-phone-ext]").forEach((link) => {
          const key = link.getAttribute("data-phone-ext");
          const entry = phones[key];
          if (!entry) return;
          link.setAttribute("href", "tel:" + entry.tel);
          const lab = link.querySelector("[data-phone-ext-label]");
          if (lab) lab.textContent = entry.label;
        });
      }

      const objectId = defaultObject[bc] || "142";
      document.querySelectorAll("[data-bc-create]").forEach((a) => {
        a.href = withObjectParam("create.html", objectId);
      });
      document.querySelectorAll("[data-bc-create-link]").forEach((a) => {
        const base = a.getAttribute("href").split("?")[0];
        const typeMatch = a.getAttribute("href").match(/[?&]type=([^&]+)/);
        let href = base;
        if (typeMatch) href += "?type=" + typeMatch[1] + "&object=" + objectId;
        else href = withObjectParam(base, objectId);
        a.href = href;
      });

      try {
        localStorage.setItem("lk-active-bc", bc);
      } catch (e) {}
    };

    bcSwitch.querySelectorAll("[data-bc]").forEach((btn) => {
      btn.addEventListener("click", () => applyBc(btn.dataset.bc));
    });
    if (bcSelect) {
      bcSelect.addEventListener("change", () => applyBc(bcSelect.value));
    }
    let start = "alpha";
    try {
      start = localStorage.getItem("lk-active-bc") || "alpha";
    } catch (e) {}
    if (bcSelect && !labels[start]) start = "alpha";
    applyBc(start);
  }

  /* ——— Вкладки УК по бизнес-центрам ——— */
  const ukTabs = document.querySelector("[data-uk-tabs]");
  if (ukTabs) {
    const panels = document.querySelectorAll("[data-uk-panel]");
    ukTabs.querySelectorAll("[data-uk]").forEach((tab) => {
      tab.addEventListener("click", () => {
        const id = tab.dataset.uk;
        ukTabs.querySelectorAll("[data-uk]").forEach((t) => t.classList.toggle("active", t === tab));
        panels.forEach((p) => (p.hidden = p.dataset.ukPanel !== id));
      });
    });
  }

  /* ——— Фильтр списков по активному БЦ (запросы, объекты) ——— */
  const bcLabels = {
    alpha: "БЦ «Альфа»",
    omega: "БЦ «Омега»",
    sigma: "БЦ «Сигма»",
    delta: "БЦ «Дельта»",
    vega: "БЦ «Вега»",
    park: "БЦ «Парк»"
  };
  const readActiveBc = () => {
    try {
      return localStorage.getItem("lk-active-bc") || "alpha";
    } catch (e) {
      return "alpha";
    }
  };

  const applyActiveBcLists = (bc) => {
    const label = bcLabels[bc] || bc;
    document.querySelectorAll("[data-bc-page-hint]").forEach((el) => {
      el.textContent = "Показаны данные для " + label + ". Сменить БЦ можно на главной.";
    });

    const reqBox = document.querySelector("[data-bc-requests]");
    if (reqBox) {
      reqBox.querySelectorAll("[data-bc]").forEach((row) => {
        row.hidden = row.dataset.bc !== bc;
      });
    }

    document.querySelectorAll("[data-bc-objects-page]").forEach((section) => {
      const cards = section.querySelectorAll("[data-bc]");
      let visible = 0;
      cards.forEach((card) => {
        const show = card.dataset.bc === bc;
        card.hidden = !show;
        if (show) visible += 1;
      });
      section.hidden = visible === 0;
    });

    const objFilter = document.querySelector("[data-bc-object-filter]");
    if (objFilter) {
      [...objFilter.options].forEach((opt) => {
        if (!opt.value) {
          opt.hidden = false;
          return;
        }
        const optBc = opt.dataset.bc || opt.value;
        opt.hidden = optBc !== bc;
      });
      objFilter.selectedIndex = 0;
    }
  };

  if (
    document.querySelector("[data-bc-requests]") ||
    document.querySelector("[data-bc-objects-page]") ||
    document.querySelector("[data-bc-page-hint]")
  ) {
    applyActiveBcLists(readActiveBc());
  }

  /* ——— Рекламный баннер над новостями ——— */
  const adStrip = document.querySelector("[data-ad-strip]");
  if (adStrip) {
    const dotsBox = adStrip.querySelector("[data-ad-dots]");
    const prevBtn = adStrip.querySelector("[data-ad-prev]");
    const nextBtn = adStrip.querySelector("[data-ad-next]");
    const allSlides = [...adStrip.querySelectorAll("[data-ad-slide]")];
    let slides = [];
    let index = 0;
    let timer = null;

    const syncNav = () => {
      if (!slides.length) {
        if (prevBtn) prevBtn.hidden = true;
        if (nextBtn) nextBtn.hidden = true;
        return;
      }
      if (prevBtn) prevBtn.hidden = slides.length < 2 || index <= 0;
      if (nextBtn) nextBtn.hidden = slides.length < 2;
    };

    const show = (i) => {
      if (!slides.length) return;
      index = ((i % slides.length) + slides.length) % slides.length;
      allSlides.forEach((slide) => slide.classList.remove("is-active"));
      slides.forEach((slide, n) => slide.classList.toggle("is-active", n === index));
      if (dotsBox) {
        dotsBox.querySelectorAll("button").forEach((btn, n) => btn.classList.toggle("is-active", n === index));
      }
      syncNav();
    };

    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    const start = () => {
      stop();
      if (slides.length < 2) return;
      timer = setInterval(() => show(index + 1), 5000);
    };

    const renderDots = () => {
      if (!dotsBox) return;
      dotsBox.innerHTML = slides
        .map((_, i) => '<button type="button" aria-label="Реклама ' + (i + 1) + '"' + (i === index ? ' class="is-active"' : "") + "></button>")
        .join("");
      dotsBox.querySelectorAll("button").forEach((btn, i) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          show(i);
          start();
        });
      });
    };

    const setBc = (bc) => {
      const activeBc = bc || "alpha";
      slides = allSlides.filter((s) => s.dataset.bc === activeBc);
      index = 0;
      renderDots();
      show(0);
      start();
    };

    if (prevBtn) {
      prevBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        show(index - 1);
        start();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        show(index + 1);
        start();
      });
    }

    adStrip.addEventListener("mouseenter", stop);
    adStrip.addEventListener("mouseleave", start);
    window.lkAdStrip = { setBc };
    setBc(readActiveBc() === "omega" || readActiveBc() === "delta" || readActiveBc() === "vega" ? "omega" : "alpha");
  }

  /* ——— Горизонтальная лента новостей: листание влево/вправо ——— */
  const newsScroller = document.querySelector("[data-news-scroller]");
  const newsNext = document.querySelector("[data-news-next]");
  const newsPrev = document.querySelector("[data-news-prev]");
  if (newsScroller) {
    const stepSize = () => {
      const card = newsScroller.querySelector(".ann-card:not([hidden])");
      return card ? card.getBoundingClientRect().width + 10 : newsScroller.clientWidth * 0.34;
    };

    const syncNewsNav = () => {
      const max = Math.max(0, newsScroller.scrollWidth - newsScroller.clientWidth - 2);
      const left = newsScroller.scrollLeft;
      if (newsPrev) newsPrev.hidden = left <= 4;
      if (newsNext) newsNext.hidden = left >= max;
    };

    if (newsNext) {
      newsNext.addEventListener("click", () => {
        newsScroller.scrollBy({ left: stepSize(), behavior: "smooth" });
      });
    }
    if (newsPrev) {
      newsPrev.addEventListener("click", () => {
        newsScroller.scrollBy({ left: -stepSize(), behavior: "smooth" });
      });
    }
    newsScroller.addEventListener("scroll", syncNewsNav, { passive: true });
    window.addEventListener("resize", syncNewsNav);
    syncNewsNav();
    window.lkNewsScrollerSync = syncNewsNav;
  }

  window.lkToast = toast;
})();
