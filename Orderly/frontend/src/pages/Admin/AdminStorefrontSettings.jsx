import { useState, useEffect, useRef, useCallback } from "react";

const API = "http://localhost:8000/api/v1/settings/";
const CACHE_KEY = "settings_storefront";

function authHeaders(extra = {}) {
  const token = localStorage.getItem("accessToken");
  return { Authorization: `Bearer ${token}`, ...extra };
}

const EMOJI_CATEGORIES = [
  { label: "🍔 Food", color: "#c0691f", emojis: [
    "🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍈","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🍆","🥑",
    "🥦","🥬","🥒","🌶️","🫑","🧄","🧅","🥔","🍠","🥐","🥯","🍞","🥖","🥨","🧀","🥚","🍳","🧈","🥞",
    "🧇","🥓","🥩","🍗","🍖","🌭","🍔","🍟","🍕","🫓","🥪","🥙","🧆","🌮","🌯","🥗","🥘","🫕","🥫",
    "🍱","🍘","🍙","🍚","🍛","🍜","🍝","🍢","🍣","🍤","🍥","🥮","🍡","🥟","🥠","🥡","🦀","🦞","🦐",
    "🦑","🦪","🍦","🍧","🍨","🍩","🍪","🎂","🍰","🧁","🥧","🍫","🍬","🍭","🍮","🍯","🍼","🥛","☕",
    "🫖","🍵","🧃","🥤","🧋","🍶","🍾","🍷","🍸","🍹","🍺","🍻","🥂","🥃","🫗","🧊","🍽️","🍴","🥄",
    "🔪","🫙","🧂",
  ]},
  { label: "🐶 Animals", color: "#27ae60", emojis: [
    "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🙈","🙉","🙊","🐔",
    "🐧","🐦","🐤","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🐛","🦋","🐌","🐞","🐜","🦟","🦗",
    "🕷️","🦂","🐢","🐍","🦎","🐙","🦑","🦐","🦞","🦀","🐡","🐠","🐟","🐬","🐳","🐋","🦈","🐊","🐅",
    "🐆","🦓","🦍","🐘","🦛","🦏","🐪","🐫","🦒","🦘","🐃","🐂","🐄","🐎","🐖","🐏","🐑","🦙","🐐",
    "🦌","🐕","🐩","🐈","🪶","🐓","🦃","🦚","🦜","🦢","🦩","🕊️","🐇","🦝","🦨","🦡","🦫","🦦","🦥",
    "🐁","🐀","🐿️","🦔","🐉","🐲",
  ]},
  { label: "🌿 Nature", color: "#16a085", emojis: [
    "🌵","🎄","🌲","🌳","🌴","🌱","🌿","☘️","🍀","🎍","🪴","🎋","🍃","🍂","🍁","🍄","🌾","💐","🌷",
    "🌹","🥀","🌺","🌸","🌼","🌻","🌞","🌝","🌛","🌜","🌚","🌕","🌙","🌟","⭐","🌠","🌌","☀️","⛅",
    "☁️","🌧️","⛈️","🌩️","🌨️","❄️","☃️","⛄","💨","💧","💦","🌊","🌈","🌪️","🌀","🪨","🪵",
  ]},
  { label: "⚽ Sports", color: "#2980b9", emojis: [
    "⚽","🏀","🏈","⚾","🥎","🎾","🏐","🏉","🥏","🎱","🏓","🏸","🏒","🏑","🥍","🏏","🪃","🥅","⛳",
    "🪁","🏹","🎣","🤿","🥊","🥋","🎽","🛹","🛷","⛸️","🥌","🎿","⛷️","🏂","🏋️","🤸","⛹️","🧘","🏄",
    "🏊","🚣","🚵","🚴","🏆","🥇","🥈","🥉","🏅","🎖️","🎪","🤹","🎭","🩰","🎨","🎬","🎤","🎧","🎼",
    "🎵","🎶","🎷","🪗","🎸","🎹","🎺","🎻","🥁","🪘","🎲","♟️","🎯","🎳","🪀","🎰","🧩","🎮","👾",
  ]},
  { label: "✈️ Travel", color: "#7d3c98", emojis: [
    "🚗","🚕","🚙","🚌","🏎️","🚓","🚑","🚒","🚐","🛻","🚚","🚛","🚜","🏍️","🛵","🛺","🚲","🛴","🛹",
    "⚓","⛵","🚤","🛥️","🚢","✈️","🛩️","🪂","💺","🚁","🚀","🛸","🧭","🏔️","⛰️","🌋","🏕️","🏖️","🏜️",
    "🏝️","🏞️","🏟️","🏛️","🏗️","🛖","🏘️","🏠","🏡","🏢","🏣","🏤","🏥","🏦","🏨","🏩","🏪","🏫","🏬",
    "🏭","🏯","🏰","💒","🗼","🗽","⛪","🕌","🛕","🕍","⛩️","🕋","⛲","⛺","🌃","🏙️","🌄","🌅","🌆",
    "🌇","🌉","🎠","🎡","🎢","💈",
  ]},
  { label: "🔧 Objects", color: "#5d6d7e", emojis: [
    "📱","💻","⌨️","🖥️","🖨️","🖱️","💾","💿","📀","🧮","📷","📸","📹","🎥","📞","☎️","📺","📻","🧭",
    "⏱️","⏰","🕰️","⌚","📡","🔋","🔌","💡","🔦","🕯️","🪔","🧯","💰","💳","🪙","📈","📉","📊","📋",
    "📌","📍","📎","📏","📐","✂️","🗑️","🔒","🔓","🔑","🗝️","🔨","🪓","⛏️","🛠️","🔧","🪛","🔩","⚙️",
    "⚖️","🔗","🧲","🪜","🧰","🪄","🔮","🧿","🧸","🪆","🖼️","🧵","🪡","🧶","🪢","👓","🕶️","🥽","🧴",
    "🧼","🪥","🪒","🧻","🪣","🧺","🧹","🧷","🧽","🪤","🛒","🚪","🪞","🪟","🛋️","🪑","🚽","🚿","🛁",
    "📚","📖","📝","✏️","🖊️","🖋️","🖌️","🖍️","📓","📔","📒","📕","📗","📘","📙","📜","📄","📃",
    "📦","📫","📬","📭","📮","✉️","📧","📨","📩","📤","📥","📣","📢","🔔","🔕","🔊","🔇","📯",
  ]},
  { label: "👕 Clothing", color: "#b03a7a", emojis: [
    "👕","👖","🧣","🧤","🧥","👗","👘","🥻","🩱","🩲","🩳","👙","👚","👛","👜","👝","🎒","🧳","👒",
    "🎩","🧢","⛑️","📿","💄","💍","💎","👠","👡","🥿","👞","👟","🥾","👢","🧦",
  ]},
  { label: "❤️ Symbols", color: "#c0392b", emojis: [
    "❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","💕","💞","💓","💗","💖","💘","💝","💟","☮️",
    "✝️","☪️","✡️","☯️","🛐","♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓",
    "♻️","⚜️","🔱","📛","🔰","⭕","✅","☑️","✔️","❌","➰","➿","✳️","✴️","❇️","💠","🔘",
    "🟥","🟧","🟨","🟩","🟦","🟪","🟫","⚫","⚪","🔴","🟠","🟡","🟢","🔵","🟣","🟤",
    "🔶","🔷","🔸","🔹","🔺","🔻","⭐","🌟","✨","💫","🎉","🎊","🎈","🎀","🎁","🏁","🚩","🎌",
  ]},
  { label: "😀 Smileys", color: "#d4ac0d", emojis: [
    "😀","😃","😄","😁","😆","😅","🤣","😂","🙂","😉","😊","😇","🥰","😍","🤩","😎","🤓","🧐","😏",
    "😒","🙄","😬","🤔","🤐","😐","😑","😶","😔","😪","😴","😷","🤒","🤕","🥳","🤠","😕","🙁","☹️",
    "😮","😲","😳","🥺","😦","😧","😨","😢","😭","😱","😤","😡","😠","🤬","😈","👿","💀","☠️","💩",
    "🤡","👹","👺","👻","👽","👾","🤖","😺","😸","😹","😻","😼","😽","🙀","😿","😾",
  ]},
  { label: "👋 People", color: "#d35400", emojis: [
    "👋","✋","👌","✌️","🤞","👍","👎","✊","👏","🙌","🤝","🙏","💪","👀","👅","👄","💅","🤳",
  ]},
];

function EmojiPicker({ current, onSelect, onClear }) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (current) {
    return (
      <button type="button" className="sf-emoji-remove-btn" onClick={onClear}>
        Remove Icon
      </button>
    );
  }

  return (
    <div className="sf-emoji-picker-wrap" ref={ref}>
      <button type="button" className="sf-emoji-trigger" onClick={() => setOpen((v) => !v)}>
        Pick Icon
      </button>
      {open && (
        <div className="sf-emoji-flyout">
          <div className="sf-emoji-tabs">
            {EMOJI_CATEGORIES.map((cat, i) => (
              <button
                key={cat.label}
                type="button"
                className={`sf-emoji-tab${activeTab === i ? " sf-emoji-tab--active" : ""}`}
                onClick={() => setActiveTab(i)}
                style={{ backgroundColor: cat.color }}
              >
                {cat.label.split(" ").slice(1).join(" ")}
              </button>
            ))}
            {activeTab !== null && (
              <button type="button" className="sf-emoji-tab-clear" onClick={() => setActiveTab(null)} title="Clear filter">✕</button>
            )}
          </div>
          <div className="sf-emoji-grid">
            {(activeTab === null
              ? EMOJI_CATEGORIES.flatMap((cat) => cat.emojis)
              : EMOJI_CATEGORIES[activeTab].emojis
            ).map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="sf-emoji-option"
                onClick={() => { onSelect(emoji); setOpen(false); }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const DEFAULT_COLORS = {
  pageBackgroundColor:    "#ffffff",
  headerSpecialTextColor: "#111111",
  headerTextColor:        "#333333",
  navBgColor:             "#222222",
  navLinkColor:           "#ffffff",
  navTextColor:           "#ffffff",
  mainLinkColor:          "#555555",
  mainTextColor:          "#333333",
  footerBgColor:          "#222222",
  footerLinkColor:        "#ffffff",
  btnBgColor:             "#eeeeee",
  btnTextColor:           "#333333",
  sectionBg1Color:        "#f5f0e8",
  sectionBg2Color:        "#e8f0f5",
};

// Each font renders its own label in its typeface
const FONTS = [
  { key: "arimo",   label: "Arimo",   family: "'Arimo', sans-serif" },
  { key: "lora",    label: "Lora",    family: "'Lora', serif" },
  { key: "roboto",  label: "Roboto",  family: "'RobotoCondensed', sans-serif" },
  { key: "playfair", label: "Playfair", family: "'PlayfairDisplay', serif" },
  { key: "raleway", label: "Raleway", family: "'Raleway', sans-serif" },
  { key: "munson",  label: "Munson",  family: "'Munson', serif" },
];

const LEFT_COLORS = [
  { key: "pageBackgroundColor",    label: "Page Background Color" },
  { key: "headerSpecialTextColor", label: "Header Special Text Color" },
  { key: "headerTextColor",        label: "Header Text Color" },
  { key: "navBgColor",             label: "Navigation Bar Background Color" },
  { key: "navLinkColor",           label: "Navigation Bar Link Color" },
  { key: "navTextColor",           label: "Navigation Bar Text Color" },
];

const RIGHT_COLORS = [
  { key: "mainLinkColor",   label: "Main Content Link Color" },
  { key: "mainTextColor",   label: "Main Content Text Color" },
  { key: "footerBgColor",   label: "Footer Bar Background Color" },
  { key: "footerLinkColor", label: "Footer Bar Link Color" },
  { key: "btnBgColor",      label: "Button Background Color" },
  { key: "btnTextColor",    label: "Button Text Color" },
  { key: "sectionBg1Color", label: "Section Accent Background Color 1" },
  { key: "sectionBg2Color", label: "Section Accent Background Color 2" },
];

const EMPTY_FORM = {
  storeTagline: "",
  showTagline: true,
  storePhone: "",
  storeAddress: "",
  hours: "",
  fontChoice: "arimo",
  ...DEFAULT_COLORS,
};

function parseStorefrontData(data) {
  return {
    storeTagline: data.storeTagline || "",
    showTagline:  data.showTagline  ?? true,
    storePhone:   data.storePhone   || "",
    storeAddress: data.storeAddress || "",
    hours:        data.hours        || "",
    fontChoice:   data.fontChoice   || "arimo",
    pageBackgroundColor:    data.pageBackgroundColor    || DEFAULT_COLORS.pageBackgroundColor,
    headerSpecialTextColor: data.headerSpecialTextColor || DEFAULT_COLORS.headerSpecialTextColor,
    headerTextColor:        data.headerTextColor        || DEFAULT_COLORS.headerTextColor,
    navBgColor:             data.navBgColor             || DEFAULT_COLORS.navBgColor,
    navLinkColor:           data.navLinkColor           || DEFAULT_COLORS.navLinkColor,
    navTextColor:           data.navTextColor           || DEFAULT_COLORS.navTextColor,
    mainLinkColor:          data.mainLinkColor          || DEFAULT_COLORS.mainLinkColor,
    mainTextColor:          data.mainTextColor          || DEFAULT_COLORS.mainTextColor,
    footerBgColor:          data.footerBgColor          || DEFAULT_COLORS.footerBgColor,
    footerLinkColor:        data.footerLinkColor        || DEFAULT_COLORS.footerLinkColor,
    btnBgColor:             data.btnBgColor             || DEFAULT_COLORS.btnBgColor,
    btnTextColor:           data.btnTextColor           || DEFAULT_COLORS.btnTextColor,
    sectionBg1Color:        data.sectionBg1Color        || DEFAULT_COLORS.sectionBg1Color,
    sectionBg2Color:        data.sectionBg2Color        || DEFAULT_COLORS.sectionBg2Color,
  };
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export default function AdminStorefrontSettings() {
  const [form, setForm] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? { ...EMPTY_FORM, ...JSON.parse(cached) } : EMPTY_FORM;
    } catch {
      return EMPTY_FORM;
    }
  });
  const [hexDrafts, setHexDrafts] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [currentFavicon, setCurrentFavicon] = useState(null);
  const [faviconPreviewError, setFaviconPreviewError] = useState(false);
  const baseline = useRef(null);
  const [loading, setLoading] = useState(() => !localStorage.getItem(CACHE_KEY));
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [categories, setCategories] = useState([]);
  const [iconDrafts, setIconDrafts] = useState({});

  useEffect(() => {
    fetch(API, { headers: authHeaders() })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        const loaded = parseStorefrontData(data);
        setForm(loaded);
        baseline.current = loaded;
        localStorage.setItem(CACHE_KEY, JSON.stringify(loaded));
        setCurrentImage(data.storeImage || null);
        setCurrentFavicon(data.favicon || null);
        setFaviconPreviewError(false);
      })
      .catch(() => {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          try { baseline.current = JSON.parse(cached); } catch {}
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/admin/categories", { headers: authHeaders() })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (!data) return;
        setCategories(data.results);
        const drafts = {};
        data.results.forEach((cat) => { drafts[cat.id] = cat.icon || ""; });
        setIconDrafts(drafts);
      })
      .catch(() => {});
  }, []);

  async function handleIconSave(catId, icon) {
    try {
      await fetch(`http://localhost:8000/api/v1/admin/categories/${catId}`, {
        method: "PATCH",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ icon }),
      });
    } catch (err) {
      console.error("Failed to save icon:", err);
    }
  }

  const isDirty =
    imageFile !== null ||
    faviconFile !== null ||
    (baseline.current &&
      Object.keys(form).some((k) => form[k] !== baseline.current[k]));

  function handleChange(e) {
    const { name, value } = e.target;
    setSaveStatus(null);
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleImageChange(e) {
    setSaveStatus(null);
    setImageFile(e.target.files[0] || null);
  }

  function handleFaviconChange(e) {
    setSaveStatus(null);
    setFaviconFile(e.target.files[0] || null);
  }

  function handleColorPickerChange(e) {
    const { name, value } = e.target;
    setSaveStatus(null);
    setForm((prev) => ({ ...prev, [name]: value }));
    setHexDrafts((prev) => ({ ...prev, [name]: value }));
  }

  function handleHexInputChange(key, raw) {
    setHexDrafts((prev) => ({ ...prev, [key]: raw }));
    setSaveStatus(null);
    const normalized = raw.startsWith("#") ? raw : "#" + raw;
    if (HEX_RE.test(normalized)) {
      setForm((prev) => ({ ...prev, [key]: normalized }));
    }
  }

  function handleHexInputBlur(key) {
    const draft = hexDrafts[key];
    if (draft === undefined) return;
    const normalized = draft.startsWith("#") ? draft : "#" + draft;
    if (!HEX_RE.test(normalized)) {
      setHexDrafts((prev) => ({ ...prev, [key]: form[key] }));
    } else if (normalized !== draft) {
      setHexDrafts((prev) => ({ ...prev, [key]: normalized }));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSaveStatus(null);

    const body = new FormData();
    body.append("storeTagline", form.storeTagline);
    body.append("showTagline", form.showTagline);
    body.append("storePhone", form.storePhone);
    body.append("storeAddress", form.storeAddress);
    body.append("hours", form.hours);
    body.append("fontChoice", form.fontChoice);
    body.append("pageBackgroundColor",    form.pageBackgroundColor);
    body.append("headerSpecialTextColor", form.headerSpecialTextColor);
    body.append("headerTextColor",        form.headerTextColor);
    body.append("navBgColor",             form.navBgColor);
    body.append("navLinkColor",           form.navLinkColor);
    body.append("navTextColor",           form.navTextColor);
    body.append("mainLinkColor",          form.mainLinkColor);
    body.append("mainTextColor",          form.mainTextColor);
    body.append("footerBgColor",          form.footerBgColor);
    body.append("footerLinkColor",        form.footerLinkColor);
    body.append("btnBgColor",             form.btnBgColor);
    body.append("btnTextColor",           form.btnTextColor);
    body.append("sectionBg1Color",        form.sectionBg1Color);
    body.append("sectionBg2Color",        form.sectionBg2Color);
    if (imageFile)  body.append("storeImage", imageFile);
    if (faviconFile) body.append("favicon", faviconFile);

    fetch(API, {
      method: "PATCH",
      headers: authHeaders(),
      body,
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        const saved = parseStorefrontData(data);
        setForm(saved);
        baseline.current = saved;
        localStorage.setItem(CACHE_KEY, JSON.stringify(saved));
        setCurrentImage(data.storeImage || null);
        setCurrentFavicon(data.favicon || null);
        setFaviconPreviewError(false);
        setImageFile(null);
        setFaviconFile(null);
        setSaveStatus("success");
      })
      .catch(() => {
        setSaveStatus("error");
        setErrorMsg("Failed to save settings.");
      })
      .finally(() => setSaving(false));
  }

  if (loading) return <p className="rpt-loading">Loading...</p>;

  const c = form;
  const previewFont = FONTS.find((f) => f.key === form.fontChoice)?.family || "'Munson', serif";

  return (
    <div>
      <div className="submenu-bar">
        <span className="submenu-label"><span style={{marginRight:"-1px"}}>⚙️</span>Branding and Storefront Management</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="sf-sett-panels">

          {/* ── BRANDING ── */}
          <div className="sf-sett-panel--branding">
            <p className="sf-panel-header">Branding</p>

            <div className="sf-branding-fields">
              <div className="sf-branding-field">
                <label htmlFor="storeImage" className="sf-branding-label">Business Logo</label>
                <p className="sf-logo-hint">For best results, use a wide banner-style image with an aspect ratio of ~4:1. We recommend at least 1200&times;300px for sharp display on high-resolution screens. PNG with a transparent background is preferred. Keep file size under 500KB.</p>
                {currentImage ? (
                  <>
                    <p className="sf-logo-preview-label">Current Logo Preview</p>
                    <img src={currentImage} alt="Business Logo" className="sett-image-preview" />
                  </>
                ) : (
                  <p className="sf-logo-preview-label">No logo uploaded</p>
                )}
                <input
                  id="storeImage"
                  name="storeImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>

              <div className="sf-branding-field">
                <label htmlFor="favicon" className="sf-branding-label">Browser Tab Icon (Favicon)</label>
                <p className="sf-logo-hint">This is the small icon that appears in the browser tab next to your page title, and in browser bookmarks. It should be a square image — ideally 32&times;32 pixels, though 64&times;64 or 128&times;128 also work well. PNG format is recommended. Keep the image simple and recognizable at very small sizes (a logo mark, initial, or symbol works better than a full logo). File size should be under 100KB.</p>
                {currentFavicon ? (
                  <>
                    <p className="sf-logo-preview-label">
                      {faviconPreviewError ? "Favicon uploaded (preview not available in this browser)" : "Current Favicon"}
                    </p>
                    {!faviconPreviewError && (
                      <img
                        src={currentFavicon}
                        alt="Favicon"
                        className="sett-favicon-preview"
                        onError={() => setFaviconPreviewError(true)}
                      />
                    )}
                  </>
                ) : (
                  <p className="sf-logo-preview-label">No favicon uploaded</p>
                )}
                <input
                  id="favicon"
                  name="favicon"
                  type="file"
                  accept="image/png,image/x-icon,image/svg+xml"
                  onChange={handleFaviconChange}
                />
              </div>

              <div className="sf-branding-field">
                <label htmlFor="storeTagline" className="sf-branding-label">Tagline</label>
                <input
                  id="storeTagline"
                  name="storeTagline"
                  type="text"
                  value={form.storeTagline}
                  onChange={handleChange}
                  placeholder="Your pause, perfected."
                  className="sf-branding-input"
                />
                <label className="sf-toggle-label">
                  <input
                    type="checkbox"
                    name="showTagline"
                    checked={form.showTagline}
                    onChange={(e) => {
                      setSaveStatus(null);
                      setForm((prev) => ({ ...prev, showTagline: e.target.checked }));
                    }}
                  />
                  Display tagline on storefront
                </label>
              </div>
            </div>

            <p className="sf-panel-header sf-panel-header--spaced">Location &amp; Hours</p>

            <div className="sf-branding-fields">
              <div className="sf-branding-field">
                <label htmlFor="storeAddress" className="sf-branding-label">Store Address</label>
                <textarea
                  id="storeAddress"
                  name="storeAddress"
                  rows={3}
                  value={form.storeAddress}
                  onChange={handleChange}
                  placeholder={"e.g. 123 Main St\nRaleigh, NC 27601"}
                  className="sf-branding-input"
                />
              </div>

              <div className="sf-branding-field">
                <label htmlFor="storePhone" className="sf-branding-label">Store Phone</label>
                <input
                  id="storePhone"
                  name="storePhone"
                  type="tel"
                  value={form.storePhone}
                  onChange={handleChange}
                  placeholder="e.g. 9195550123"
                  className="sf-branding-input"
                />
              </div>

              <div className="sf-branding-field">
                <label htmlFor="hours" className="sf-branding-label">Hours</label>
                <textarea
                  id="hours"
                  name="hours"
                  rows={4}
                  value={form.hours}
                  onChange={handleChange}
                  placeholder={"e.g. Mon–Fri: 7am–6pm\nSat–Sun: 8am–4pm"}
                  className="sf-branding-input"
                />
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="sf-sett-panels-right">

          {/* ── CUSTOMIZE YOUR STOREFRONT ── */}
          <div className="sf-sett-panel--customize">
            <p className="sf-customize-header">Customize Your Storefront</p>
            <p className="sf-customize-subhead">Customize the look of your storefront to match your branding.</p>

            <div className="sf-customize-inner">

              {/* Font choice */}
              <div className="sf-customize-tile">
                <p className="sf-customize-section-label">Font Choice</p>
                <p className="sf-customize-section-hint">Choose the appearance of the text on your website.</p>
                <div className="sf-font-grid">
                  {FONTS.map((f) => (
                    <label key={f.key} className="sf-font-option">
                      <input
                        type="radio"
                        name="fontChoice"
                        value={f.key}
                        checked={form.fontChoice === f.key}
                        onChange={handleChange}
                      />
                      <span
                        className="sf-font-option__name"
                        style={{ fontFamily: f.family }}
                      >
                        {f.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Color list + Live preview side by side */}
              <div className="sf-color-preview-row sf-customize-tile">

                <div className="sf-color-section">
                  <p className="sf-customize-section-label">Page Style Color Choices</p>
                  <div className="sf-color-col">
                    {[...LEFT_COLORS, ...RIGHT_COLORS].map((col) => (
                      <div className="sf-color-row" key={col.key}>
                        <span className="sf-color-row__label">{col.label}</span>
                        <input
                          type="color"
                          name={col.key}
                          value={form[col.key]}
                          onChange={handleColorPickerChange}
                          className="sf-color-swatch"
                          title="Click to open color picker"
                        />
                        <input
                          type="text"
                          className="sf-hex-input"
                          value={hexDrafts[col.key] ?? form[col.key]}
                          onChange={(e) => handleHexInputChange(col.key, e.target.value)}
                          onBlur={() => handleHexInputBlur(col.key)}
                          maxLength={7}
                          spellCheck={false}
                          placeholder="#000000"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live preview — updates in real time */}
                <div className="sf-preview">
                  <p className="sf-preview-header-label">Live Style Preview</p>
                  <div className="sf-preview-panel" style={{ fontFamily: previewFont }}>
                    <div className="sf-preview-row" style={{ backgroundColor: c.pageBackgroundColor }}>
                      <span style={{ color: c.headerSpecialTextColor, fontWeight: "bold" }}>Header Special Text</span>
                      <span style={{ color: c.headerTextColor }}>Header Text</span>
                    </div>
                    <div className="sf-preview-row sf-preview-row--bar" style={{ backgroundColor: c.navBgColor }}>
                      <span className="sf-preview-bar-label" style={{ color: c.navTextColor }}>Navigation</span>
                      <span style={{ color: c.navLinkColor, fontWeight: "bold" }}>Link</span>
                      <span style={{ color: c.navTextColor }}>Text</span>
                    </div>
                    <div className="sf-preview-row sf-preview-row--main" style={{ backgroundColor: c.pageBackgroundColor }}>
                      <div className="sf-preview-main-content">
                        <span style={{ color: c.mainTextColor }}>Main content text</span>
                        <span style={{ color: c.mainLinkColor, fontWeight: "bold" }}>Main content link</span>
                        <div className="sf-preview-sections">
                          <div className="sf-preview-section-swatch" style={{ backgroundColor: c.sectionBg1Color }}>
                            <span style={{ color: c.mainTextColor }}>Section 1</span>
                          </div>
                          <div className="sf-preview-section-swatch" style={{ backgroundColor: c.sectionBg2Color }}>
                            <span style={{ color: c.mainTextColor }}>Section 2</span>
                          </div>
                        </div>
                        <span
                          className="sf-preview-btn"
                          style={{ backgroundColor: c.btnBgColor, color: c.btnTextColor }}
                        >
                          Button Preview
                        </span>
                      </div>
                    </div>
                    <div className="sf-preview-row sf-preview-row--bar" style={{ backgroundColor: c.footerBgColor }}>
                      <span className="sf-preview-bar-label" style={{ color: c.footerLinkColor }}>Footer</span>
                      <span style={{ color: c.footerLinkColor, fontWeight: "bold" }}>Link</span>
                      <span style={{ color: c.footerLinkColor }}>Text</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* ── CUSTOMIZE YOUR ICONS ── */}
          <div className="sf-sett-panel--icons">
            <p className="sf-customize-header">Customize Your Icons</p>
            <p className="sf-customize-subhead">Assign an icon to each category that appears on your storefront filters.</p>
            {categories.length === 0 ? (
              <p className="sf-icons-empty">No categories found.</p>
            ) : (
              <table className="sf-icons-table">
                <thead>
                  <tr>
                    <th className="sf-icons-th sf-icons-th--icon">Icon</th>
                    <th className="sf-icons-th sf-icons-th--name">Category</th>
                    <th className="sf-icons-th sf-icons-th--btn"></th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat.id}>
                      <td className="sf-icons-td sf-icons-td--icon">{iconDrafts[cat.id] || ""}</td>
                      <td className="sf-icons-td sf-icons-td--name">{cat.name}</td>
                      <td className="sf-icons-td sf-icons-td--btn">
                        <EmojiPicker
                          current={iconDrafts[cat.id] ?? ""}
                          onSelect={(emoji) => {
                            setIconDrafts((prev) => ({ ...prev, [cat.id]: emoji }));
                            handleIconSave(cat.id, emoji);
                          }}
                          onClear={() => {
                            setIconDrafts((prev) => ({ ...prev, [cat.id]: "" }));
                            handleIconSave(cat.id, "");
                          }}
                        />
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          </div>{/* end sf-sett-panels-right */}

        </div>

        {/* Save */}
        <div className="sf-sett-form-actions">
          {isDirty && <span className="sett-unsaved">Unsaved changes</span>}
          {saveStatus === "success" && <span className="inv-save-success">Settings saved!</span>}
          {saveStatus === "error" && <span className="inv-error">{errorMsg}</span>}
          <button type="submit" className="sett-save-btn" disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
