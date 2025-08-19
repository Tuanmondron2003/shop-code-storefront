import React, { useMemo, useState } from "react";

/* =================== Assets =================== */
const img = (q: string) =>
  `https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop`;

/* =================== Types ==================== */
export type Category = "All" | "Top Up" | "Gift Card" | "Game Pass" | "Bundle";
export type SortKey = "relevance" | "priceAsc" | "priceDesc" | "rating";
export type CartItem = { id: string; qty: number };
export type Product = {
  id: string;
  name: string;
  category: Category;
  price: number;   // GIÁ BẰNG VND (vd 49000)
  rating: number;
  image: string;
  badge?: string;
};

type Brand = {
  siteName: string;
  logoUrl: string;
  heroUrl?: string; // ảnh banner Hero
};

/* =================== Seed data ================= */
const SEED: readonly Product[] = [
  { id: "r1", name: "Top-Up 800 Coins", category: "Top Up", price: 49000, rating: 4.8, image: img("coins"), badge: "Hot" },
  { id: "r2", name: "Top-Up 1,700 Coins", category: "Top Up", price: 99000, rating: 4.9, image: img("coins2"), badge: "Best seller" },
  { id: "r3", name: "Gift Card 10K", category: "Gift Card", price: 10000, rating: 4.7, image: img("giftcard"), badge: "New" },
  { id: "r4", name: "Gift Card 25K", category: "Gift Card", price: 25000, rating: 4.6, image: img("giftcard25") },
  { id: "r5", name: "Game Pass – Builder Kit", category: "Game Pass", price: 35000, rating: 4.5, image: img("builder") },
  { id: "r6", name: "Game Pass – VIP", category: "Game Pass", price: 69900, rating: 4.4, image: img("vip") },
  { id: "r7", name: "Bundle Saver A", category: "Bundle", price: 149000, rating: 4.8, image: img("bundleA") },
  { id: "r8", name: "Bundle Saver B", category: "Bundle", price: 199000, rating: 4.9, image: img("bundleB") },
];

/* =================== Helpers (testable) ======= */
const formatVND = (x: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(x);

export const addCart = (prev: CartItem[], id: string): CartItem[] => {
  const found = prev.find(x => x.id === id);
  return found ? prev.map(x => x.id === id ? { ...x, qty: x.qty + 1 } : x) : [...prev, { id, qty: 1 }];
};
export const incCart = (prev: CartItem[], id: string): CartItem[] =>
  prev.map(x => x.id === id ? { ...x, qty: x.qty + 1 } : x);
export const decCart = (prev: CartItem[], id: string): CartItem[] =>
  prev.flatMap(x => x.id === id ? (x.qty > 1 ? [{ ...x, qty: x.qty - 1 }] : []) : [x]);
export const removeCart = (prev: CartItem[], id: string): CartItem[] =>
  prev.filter(x => x.id !== id);
export const cartTotal = (cart: CartItem[], products: Product[]): number =>
  cart.reduce((s, it) => {
    const p = products.find(x => x.id === it.id);
    return s + (p ? p.price * it.qty : 0);
  }, 0);

/* ====== tiny runtime tests: run once in browser ====== */
(function runCartTestsOnce() {
  if (typeof window === "undefined") return;
  const w = window as any;
  if (w.__storefront_tests_done__) return;
  w.__storefront_tests_done__ = true;

  let c: CartItem[] = [];
  c = addCart(c, "r1"); console.assert(c.length === 1 && c[0].qty === 1, "add -> 1");
  c = incCart(c, "r1"); console.assert(c[0].qty === 2, "inc -> 2");
  c = decCart(c, "r1"); console.assert(c[0].qty === 1, "dec -> 1");
  c = decCart(c, "r1"); console.assert(c.length === 0, "dec -> remove");
})();

/* extra tests */
(function runMoreTestsOnce() {
  if (typeof window === "undefined") return;
  const w = window as any;
  if (w.__storefront_more_tests_done__) return;
  w.__storefront_more_tests_done__ = true;

  const v = formatVND(1000);
  console.assert(/₫/.test(v) || /VND/.test(v), "formatVND returns VND currency");
  const prods: Product[] = [{ id: "a", name: "A", category: "Top Up", price: 1000, rating: 4, image: "" }];
  const ct = cartTotal([{ id: "a", qty: 3 }], prods);
  console.assert(ct === 3000, "cartTotal = price * qty");
})();

/* ================ Admin Form (Create Product) ================ */
function AdminForm({ onAdd }: { onAdd: (p: Product) => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("Top Up");
  const [price, setPrice] = useState<number>(49000);
  const [rating, setRating] = useState<number>(4.8);
  const [badge, setBadge] = useState<string>("");
  const [image, setImage] = useState<string>("");

  const onFile = (f: File) => setImage(URL.createObjectURL(f));

  return (
    <form
      className="grid md:grid-cols-5 gap-3"
      onSubmit={e => {
        e.preventDefault();
        const id = "p_" + Math.random().toString(36).slice(2, 9);
        onAdd({ id, name, category, price, rating, image, badge: badge || undefined });
        setName(""); setBadge("");
      }}
    >
      <input className="border rounded-xl px-3 py-2 md:col-span-2" placeholder="Tên sản phẩm"
        value={name} onChange={e=>setName(e.target.value)} required />
      <select className="border rounded-xl px-3 py-2" value={category} onChange={e=>setCategory(e.target.value as Category)}>
        <option>Top Up</option><option>Gift Card</option><option>Game Pass</option><option>Bundle</option><option>All</option>
      </select>
      <input type="number" step="100" min="0" className="border rounded-xl px-3 py-2" value={price}
        onChange={e=>setPrice(Number(e.target.value))} />
      <input type="number" step="0.1" min="0" max="5" className="border rounded-xl px-3 py-2" value={rating}
        onChange={e=>setRating(Number(e.target.value))} />
      <input className="border rounded-xl px-3 py-2" placeholder="Badge (tuỳ chọn)" value={badge} onChange={e=>setBadge(e.target.value)} />
      <input className="border rounded-xl px-3 py-2 md:col-span-3" placeholder="URL ảnh (hoặc tải tệp)"
        value={image} onChange={e=>setImage(e.target.value)} />
      <label className="md:col-span-1 px-3 py-2 rounded-xl border text-sm cursor-pointer flex items-center justify-center">
        Upload ảnh
        <input type="file" accept="image/*" className="hidden" onChange={e=>{const f=e.target.files?.[0]; if(f) onFile(f);}} />
      </label>
      <button className="md:col-span-1 px-3 py-2 rounded-xl bg-indigo-600 text-white">Thêm</button>
    </form>
  );
}

/* ================ Admin Brand Settings ================ */
function AdminBrandSettings({
  brand,
  setBrand,
}: {
  brand: Brand;
  setBrand: (b: Brand) => void;
}) {
  const [siteName, setSiteName] = useState<string>(brand.siteName);
  const [logoUrl, setLogoUrl] = useState<string>(brand.logoUrl);
  const [heroUrl, setHeroUrl] = useState<string>(brand.heroUrl || "");

  const onLogoFile = (file: File) => setLogoUrl(URL.createObjectURL(file));
  const onHeroFile = (file: File) => setHeroUrl(URL.createObjectURL(file));

  const save = () => {
    const next = {
      siteName: siteName || "Shop Code",
      logoUrl: logoUrl || "",
      heroUrl: heroUrl || "",
    };
    setBrand(next);
    try { localStorage.setItem("brand_settings", JSON.stringify(next)); } catch {}
    alert("Đã lưu cài đặt thương hiệu");
  };

  const reset = () => {
    const def = { siteName: "Shop Code", logoUrl: "", heroUrl: "" };
    setSiteName(def.siteName);
    setLogoUrl(def.logoUrl);
    setHeroUrl(def.heroUrl);
  };

  return (
    <div className="mt-6 border rounded-xl p-4">
      <div className="font-semibold mb-3">Cài đặt thương hiệu</div>
      <div className="grid md:grid-cols-3 gap-4">
        {/* Nhập liệu */}
        <div className="md:col-span-2 space-y-4">
          <div>
            <label className="text-sm text-neutral-600">Tên website</label>
            <input
              className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="Tên hiển thị (vd: Shop Code)"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {/* Logo */}
            <div>
              <label className="text-sm text-neutral-600">Logo URL</label>
              <input
                className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="Dán URL ảnh (hoặc dùng Upload ảnh)"
              />
              <label className="mt-2 inline-flex px-3 py-2 rounded-xl border text-sm cursor-pointer">
                Upload logo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onLogoFile(f);
                  }}
                />
              </label>
            </div>

            {/* Banner */}
            <div>
              <label className="text-sm text-neutral-600">Ảnh banner (Hero) URL</label>
              <input
                className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2"
                value={heroUrl}
                onChange={(e) => setHeroUrl(e.target.value)}
                placeholder="Dán URL ảnh hoặc upload"
              />
              <label className="mt-2 inline-flex px-3 py-2 rounded-xl border text-sm cursor-pointer">
                Upload banner
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onHeroFile(f);
                  }}
                />
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="px-3 py-2 rounded-xl bg-indigo-600 text-white" onClick={save}>
              Lưu
            </button>
            <button className="px-3 py-2 rounded-xl border" onClick={reset}>
              Khôi phục mặc định
            </button>
          </div>
        </div>

        {/* Xem trước */}
        <div className="space-y-4">
          <div className="border rounded-xl p-3 bg-white">
            <div className="text-sm text-neutral-500 mb-2">Xem trước logo</div>
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img src={logoUrl} alt="logo preview" className="h-12 w-12 rounded-xl object-cover ring-1 ring-neutral-200" />
              ) : (
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600" />
              )}
              <div className="font-semibold">{siteName || "Shop Code"}</div>
            </div>
          </div>

          <div className="border rounded-xl p-3 bg-white">
            <div className="text-sm text-neutral-500 mb-2">Xem trước banner</div>
            <div className="aspect-[16/10] w-full rounded-xl ring-1 ring-neutral-200 overflow-hidden bg-neutral-100">
              <img
                src={heroUrl || img("hero")}
                alt="hero preview"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =================== UI ======================= */
export default function Storefront() {
  // search/filter
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("All");
  const [sort, setSort] = useState<SortKey>("relevance");

  // auth demo (username + password, không bắt buộc email)
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  // cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  // products
  const [products, setProducts] = useState<Product[]>(
    ((): Product[] => {
      try { const raw = localStorage.getItem("inventory"); if (raw) return JSON.parse(raw); } catch {}
      return SEED.slice() as Product[];
    })()
  );
  React.useEffect(() => { try { localStorage.setItem("inventory", JSON.stringify(products)); } catch {} }, [products]);

  // brand settings
  const [brand, setBrand] = useState<Brand>(() => {
    try {
      const raw = localStorage.getItem("brand_settings");
      if (raw) {
        const obj = JSON.parse(raw);
        return { siteName: obj.siteName ?? "Shop Code", logoUrl: obj.logoUrl ?? "", heroUrl: obj.heroUrl ?? "" };
      }
    } catch {}
    return { siteName: "Shop Code", logoUrl: "", heroUrl: "" };
  });

  // admin auth (không có đăng ký)
  const ADMIN_USERNAME = "tuanmondron";
  const ADMIN_PASSWORD = "hayquenlam";

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [adminShowPass, setAdminShowPass] = useState(false);
  const [adminError, setAdminError] = useState("");

  React.useEffect(() => {
    try { const raw = localStorage.getItem("admin_user"); if (raw === ADMIN_USERNAME) setIsAdmin(true); } catch {}
  }, []);
  const adminLogout = () => { setIsAdmin(false); try { localStorage.removeItem("admin_user"); } catch {} };

  // Edit modal states
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState<Category>("Top Up");
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editRating, setEditRating] = useState<number>(0);
  const [editBadge, setEditBadge] = useState<string>("");
  const [editImage, setEditImage] = useState<string>("");

  function openEdit(p: Product) {
    setEditing(p);
    setEditName(p.name);
    setEditCategory(p.category);
    setEditPrice(p.price);
    setEditRating(p.rating);
    setEditBadge(p.badge ?? "");
    setEditImage(p.image);
    setEditOpen(true);
  }

  // persist user (backward compatibility)
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("demo_user");
      if (raw) {
        const obj = JSON.parse(raw);
        const name = obj?.name ?? obj?.email ?? "";
        if (name) setUser({ name });
      }
    } catch {}
  }, []);
  const logout = () => { setUser(null); try { localStorage.removeItem("demo_user"); } catch {} };

  // Derived lists
  const filtered = useMemo(() => {
    let list = products.filter(
      p => (category === "All" || p.category === category) &&
           p.name.toLowerCase().includes(query.trim().toLowerCase())
    );
    switch (sort) {
      case "priceAsc":  list = [...list].sort((a,b)=>a.price-b.price); break;
      case "priceDesc": list = [...list].sort((a,b)=>b.price-a.price); break;
      case "rating":    list = [...list].sort((a,b)=>b.rating-a.rating); break;
    }
    return list;
  }, [products, category, query, sort]);

  const itemsInCart = useMemo(()=> cart.reduce((s,i)=>s+i.qty,0), [cart]);
  const total = useMemo(()=> cartTotal(cart, products), [cart, products]);

  const addToCart  = (id: string) => { setCart(prev => addCart(prev, id)); setCartOpen(true); };
  const decItem    = (id: string) => setCart(prev => decCart(prev, id));
  const incItem    = (id: string) => setCart(prev => incCart(prev, id));
  const removeItem = (id: string) => setCart(prev => removeCart(prev, id));
  const checkout   = () => alert("Demo checkout: hãy nối VNPay/MoMo/Stripe…");

  const CATEGORIES: readonly Category[] = ["All","Top Up","Gift Card","Game Pass","Bundle"];

  /* ====== Image Preview Modal state ====== */
  const [preview, setPreview] = useState<{ src: string; alt: string } | null>(null);
  const openPreview = (src: string, alt: string) => setPreview({ src, alt });
  const closePreview = () => setPreview(null);

  // Close preview on ESC
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closePreview(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/80 border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2">
            {brand.logoUrl ? (
              <img src={brand.logoUrl} alt="logo" className="h-9 w-9 rounded-xl object-cover ring-1 ring-neutral-200" />
            ) : (
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600" />
            )}
            <div className="font-bold text-lg">{brand.siteName || "Shop Code"}</div>
          </div>
          <div className="flex-1" />
          <div className="hidden md:flex items-center gap-2 rounded-2xl border border-neutral-200 px-3 py-2 w-full max-w-xl focus-within:ring-2 ring-indigo-500">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M21 21l-4.3-4.3"/><circle cx="11" cy="11" r="7"/></svg>
            <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Tìm kiếm gói nạp, gift card…" className="w-full bg-transparent outline-none text-sm"/>
          </div>
          {!isAdmin ? (
            <button onClick={()=>setAdminLoginOpen(true)} className="px-3 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-sm mr-2">Đăng nhập quản trị</button>
          ) : (
            <>
              <button onClick={()=>setAdminOpen(true)} className="px-3 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-sm mr-2">Quản trị</button>
              <button onClick={adminLogout} className="px-3 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-sm mr-2">Đăng xuất Q.trị</button>
            </>
          )}
          {!user ? (
            <button onClick={()=>setAuthOpen(true)} className="px-3 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-sm">Đăng nhập</button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="hidden md:inline text-sm text-neutral-600">Xin chào, <strong>{user.name}</strong></span>
              <button onClick={logout} className="px-3 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-sm">Đăng xuất</button>
            </div>
          )}
          <button onClick={()=>setCartOpen(true)} className="relative px-3 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700">
            <span>Giỏ hàng</span>
            {itemsInCart>0 && (<span className="absolute -top-2 -right-2 text-xs bg-rose-500 text-white rounded-full px-1.5 py-0.5 shadow">{itemsInCart}</span>)}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-white to-indigo-50 border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 py-10 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
              Nạp game, Gift card & Game Pass <span className="text-indigo-600">nhanh – uy tín</span>
            </h1>
            <p className="mt-3 text-neutral-600">
              Giao mã tự động 24/7, nhiều phương thức thanh toán. Mã demo – bạn có thể tích hợp cổng thanh toán thật sau.
            </p>
            <div className="mt-5 flex gap-3">
              <a href="#catalog" className="px-4 py-2 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800">Xem sản phẩm</a>
              <button onClick={()=>{setIsRegister(true); setAuthOpen(true);}} className="px-4 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-100">Tạo tài khoản</button>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[16/10] w-full rounded-3xl bg-white shadow-lg ring-1 ring-neutral-200 overflow-hidden">
              <img src={brand.heroUrl || img("hero")} alt="hero" className="w-full h-full object-cover"/>
            </div>
            <div className="absolute -bottom-5 -right-5 bg-white rounded-2xl shadow ring-1 ring-neutral-200 px-4 py-3 text-sm">
              <div className="font-semibold">Tự động giao mã</div>
              <div className="text-neutral-600">Trong vài giây sau khi thanh toán</div>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog */}
      <section id="catalog" className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-wrap items-center gap-3">
          <div className="shrink-0 text-sm text-neutral-500">Danh mục:</div>
          <div className="flex gap-2 flex-wrap">
            {(["All","Top Up","Gift Card","Game Pass","Bundle"] as const).map(c=>(
              <button key={c} onClick={()=>setCategory(c)} className={`px-3 py-1.5 rounded-full border text-sm ${category===c?"bg-neutral-900 text-white border-neutral-900":"border-neutral-300 hover:bg-neutral-100"}`}>{c}</button>
            ))}
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <label className="text-sm text-neutral-500">Sắp xếp</label>
            <select value={sort} onChange={e=>setSort(e.target.value as SortKey)} className="text-sm border border-neutral-300 rounded-xl px-3 py-2 bg-white">
              <option value="relevance">Phù hợp nhất</option>
              <option value="priceAsc">Giá tăng dần</option>
              <option value="priceDesc">Giá giảm dần</option>
              <option value="rating">Đánh giá cao</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(p=>(
            <article
              key={p.id}
              className="group rounded-2xl overflow-hidden bg-white ring-1 ring-neutral-200 hover:shadow-lg transition-all min-h-[480px]"
            >
              <div className="relative">
                <img
                  src={p.image}
                  alt={p.name}
                  /* tăng chiều cao ảnh từ h-44 → h-64 để card cao hơn theo CHIỀU DỌC */
                  className="h-64 w-full object-cover cursor-zoom-in"
                  onClick={()=>openPreview(p.image, p.name)}
                  title="Nhấn để phóng to"
                />
                {p.badge && (
                  <span className="absolute top-2 left-2 text-xs px-2 py-1 rounded-full bg-indigo-600 text-white shadow">
                    {p.badge}
                  </span>
                )}
              </div>
              <div className="p-4 flex flex-col justify-between h-[calc(480px-16rem)]">
                <div>
                  <div className="text-xs text-neutral-500">{p.category}</div>
                  <h3 className="mt-1 font-semibold line-clamp-2">{p.name}</h3>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-lg font-bold">{formatVND(p.price)}</div>
                  <div className="flex items-center gap-1 text-amber-500" aria-label={`rating ${p.rating}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4 fill-current"><path d="M12 2l3.09 6.26L22 9.27l-5 4.88L18.18 22 12 18.56 5.82 22 7 14.15l-5-4.88 6.91-1.01z"/></svg>
                    <span className="text-xs text-neutral-600">{p.rating}</span>
                  </div>
                </div>
                <button
                  onClick={()=>addToCart(p.id)}
                  className="mt-3 w-full px-3 py-2 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800"
                >
                  Thêm vào giỏ
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 mt-12">
        <div className="mx-auto max-w-7xl px-4 py-10 grid md:grid-cols-4 gap-8 text-sm">
          <div>
            <div className="font-bold">{brand.siteName || "Shop Code"}</div>
            <p className="mt-2 text-neutral-600">Demo storefront. Không chứa thương hiệu hay nội dung vi phạm. Dễ tùy biến cho bất kỳ sản phẩm số.</p>
          </div>
          <div>
            <div className="font-semibold">Hỗ trợ</div>
            <ul className="mt-2 space-y-1 text-neutral-600">
              <li>Trung tâm trợ giúp</li>
              <li>Điều khoản & Chính sách</li>
              <li>Liên hệ</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold">Thanh toán</div>
            <ul className="mt-2 space-y-1 text-neutral-600">
              <li>Ví điện tử</li>
              <li>Chuyển khoản</li>
              <li>Thẻ quốc tế</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold">Newsletter</div>
            <div className="mt-2 flex gap-2">
              <input placeholder="Email của bạn" className="flex-1 rounded-xl border border-neutral-300 px-3 py-2"/>
              <button className="px-3 py-2 rounded-xl bg-indigo-600 text-white">Đăng ký</button>
            </div>
          </div>
        </div>
      </footer>

      {/* Cart drawer */}
      <div className={`fixed inset-0 z-50 ${cartOpen?"pointer-events-auto":"pointer-events-none"}`}>
        <div className={`absolute inset-0 bg-black/40 transition-opacity ${cartOpen?"opacity-100":"opacity-0"}`} onClick={()=>setCartOpen(false)} />
        <aside className={`absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-xl transition-transform ${cartOpen?"translate-x-0":"translate-x-full"}`}>
          <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
            <div className="font-bold">Giỏ hàng</div>
            <button onClick={()=>setCartOpen(false)} className="p-2 rounded-lg hover:bg-neutral-100" aria-label="Đóng">✕</button>
          </div>
          <div className="p-4 space-y-3 max-h-[calc(100%-180px)] overflow-auto">
            {cart.length===0 && <div className="text-neutral-500 text-sm">Chưa có sản phẩm nào.</div>}
            {cart.map(it=>{
              const p = products.find(x=>x.id===it.id)!;
              return (
                <div key={it.id} className="flex gap-3 items-center border border-neutral-200 rounded-2xl p-3">
                  <img src={p.image} alt={p.name} className="h-14 w-14 rounded-xl object-cover"/>
                  <div className="flex-1">
                    <div className="font-medium line-clamp-1">{p.name}</div>
                    <div className="text-sm text-neutral-600">{formatVND(p.price)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={()=>decItem(it.id)} className="size-8 rounded-lg border border-neutral-300">−</button>
                    <div className="w-6 text-center">{it.qty}</div>
                    <button onClick={()=>incItem(it.id)} className="size-8 rounded-lg border border-neutral-300">＋</button>
                  </div>
                  <button onClick={()=>removeItem(it.id)} className="ml-2 text-neutral-400 hover:text-rose-500" aria-label="Xoá">🗑️</button>
                </div>
              );
            })}
          </div>
          <div className="absolute bottom-0 left-0 right-0 border-t border-neutral-200 p-4 bg-white">
            <div className="flex items-center justify-between font-semibold">
              <span>Tổng</span>
              <span>{formatVND(total)}</span>
            </div>
            <button onClick={checkout} disabled={!cart.length} className="mt-3 w-full px-4 py-3 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-50">Thanh toán</button>
          </div>
        </aside>
      </div>

      {/* Auth modal (user) */}
      <div className={`fixed inset-0 z-50 ${authOpen?"":"hidden"}`}>
        <div className="absolute inset-0 bg-black/40" onClick={()=>setAuthOpen(false)} />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(92vw,520px)] bg-white rounded-2xl shadow-xl ring-1 ring-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div className="font-bold text-lg">{isRegister ? "Đăng ký" : "Đăng nhập"}</div>
            <button onClick={()=>setAuthOpen(false)} className="p-2 rounded-lg hover:bg-neutral-100">✕</button>
          </div>
          <form className="mt-4 space-y-3" onSubmit={(e)=>{e.preventDefault();
            setAuthError("");
            if(!username.trim()){ setAuthError("Vui lòng nhập tài khoản"); return; }
            if(password.length<6){ setAuthError("Mật khẩu tối thiểu 6 ký tự"); return; }
            const u={name: username.trim()}; setUser(u);
            try{localStorage.setItem("demo_user", JSON.stringify(u));}catch{}
            setAuthOpen(false); setIsRegister(false);
          }}>
            <div>
              <label className="text-sm text-neutral-600">Tài khoản</label>
              <input type="text" required value={username} onChange={(e)=>setUsername(e.target.value)} className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2" placeholder="Nhập tên tài khoản"/>
            </div>
            <div>
              <label className="text-sm text-neutral-600">Mật khẩu</label>
              <div className="mt-1 relative">
                <input type={showPassword?"text":"password"} required value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full rounded-xl border border-neutral-300 px-3 py-2 pr-12" placeholder="••••••••"/>
                <button type="button" onClick={()=>setShowPassword(v=>!v)} className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-sm text-neutral-600 hover:text-neutral-900" aria-label={showPassword?"Ẩn mật khẩu":"Hiện mật khẩu"}>{showPassword?"Ẩn":"Hiện"}</button>
              </div>
            </div>
            {authError && <div className="text-sm text-rose-600">{authError}</div>}
            <button className="w-full px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700">{isRegister ? "Đăng ký" : "Đăng nhập"}</button>
            <p className="text-xs text-neutral-500">
              {isRegister ? "Đã có tài khoản? " : "Chưa có tài khoản? "}
              <button type="button" onClick={()=>setIsRegister(!isRegister)} className="text-indigo-600 underline">{isRegister ? "Đăng nhập" : "Đăng ký"}</button>
            </p>
          </form>
        </div>
      </div>

      {/* Admin Login Modal */}
      <div className={`fixed inset-0 z-50 ${adminLoginOpen ? "" : "hidden"}`}>
        <div className="absolute inset-0 bg-black/40" onClick={()=>setAdminLoginOpen(false)} />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(92vw,420px)] bg-white rounded-2xl shadow-xl ring-1 ring-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div className="font-bold text-lg">Đăng nhập Quản trị</div>
            <button onClick={()=>setAdminLoginOpen(false)} className="p-2 rounded-lg hover:bg-neutral-100">✕</button>
          </div>
          <form className="mt-4 space-y-3" onSubmit={(e)=>{e.preventDefault();
            setAdminError("");
            if(adminUser !== ADMIN_USERNAME || adminPass !== ADMIN_PASSWORD){
              setAdminError("Sai tài khoản hoặc mật khẩu.");
              return;
            }
            setIsAdmin(true);
            try{ localStorage.setItem("admin_user", ADMIN_USERNAME); }catch{}
            setAdminLoginOpen(false);
            setAdminUser(""); setAdminPass("");
          }}>
            <div>
              <label className="text-sm text-neutral-600">Tài khoản</label>
              <input type="text" value={adminUser} onChange={e=>setAdminUser(e.target.value)} className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2" placeholder="tài khoản quản trị" />
            </div>
            <div>
              <label className="text-sm text-neutral-600">Mật khẩu</label>
              <div className="mt-1 relative">
                <input type={adminShowPass?"text":"password"} value={adminPass} onChange={e=>setAdminPass(e.target.value)} className="w-full rounded-xl border border-neutral-300 px-3 py-2 pr-12" placeholder="••••••••"/>
                <button type="button" onClick={()=>setAdminShowPass(v=>!v)} className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-sm text-neutral-600 hover:text-neutral-900">{adminShowPass?"Ẩn":"Hiện"}</button>
              </div>
            </div>
            {adminError && <div className="text-sm text-rose-600">{adminError}</div>}
            <button className="w-full px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700">Đăng nhập</button>
            <p className="text-xs text-neutral-500">Tài khoản: <b>tuanmondron</b> • Mật khẩu: <b>hayquenlam</b></p>
          </form>
        </div>
      </div>

      {/* Admin Panel */}
      {adminOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={()=>setAdminOpen(false)} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(96vw,920px)] bg-white rounded-2xl shadow-xl ring-1 ring-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="font-bold text-lg">Quản trị</div>
              <div className="flex gap-2">
                <button onClick={()=>setAdminOpen(false)} className="px-3 py-2 rounded-xl border border-neutral-300 text-sm">Đóng</button>
              </div>
            </div>

            {/* Tạo mới sản phẩm */}
            <div className="mb-4">
              <div className="font-semibold mb-2">Thêm sản phẩm</div>
              <AdminForm onAdd={(p)=>setProducts(prev=>[p, ...prev])} />
            </div>

            {/* Danh sách sản phẩm */}
            <div className="mt-2 max-h-[36vh] overflow-auto grid sm:grid-cols-2 gap-3">
              {products.map(p=>(
                <div key={p.id} className="border rounded-xl p-3 flex gap-3">
                  <img src={p.image} className="h-16 w-16 rounded-lg object-cover"/>
                  <div className="flex-1">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-sm text-neutral-600">{p.category} • {formatVND(p.price)}</div>
                    <div className="text-xs text-neutral-500">{p.badge || "—"}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button className="px-3 py-1 rounded-lg border" onClick={()=>openEdit(p)}>Sửa</button>
                    <button className="px-3 py-1 rounded-lg border text-rose-600" onClick={()=>setProducts(prev=>prev.filter(x=>x.id!==p.id))}>Xoá</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cài đặt thương hiệu */}
            <AdminBrandSettings brand={brand} setBrand={setBrand} />

            {/* Export/Import dữ liệu sản phẩm */}
            <div className="mt-6 flex flex-wrap gap-2">
              <button onClick={()=>{ const data = JSON.stringify(products, null, 2); const blob = new Blob([data], {type:'application/json'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'products.json'; a.click(); URL.revokeObjectURL(url); }} className="px-3 py-2 rounded-xl border border-neutral-300 text-sm">Export JSON</button>
              <label className="px-3 py-2 rounded-xl border border-neutral-300 text-sm cursor-pointer">
                Import JSON
                <input type="file" accept="application/json" className="hidden" onChange={async e=>{ const f=e.target.files?.[0]; if(!f) return; try{ const arr=JSON.parse(await f.text()) as Product[]; if(Array.isArray(arr)) setProducts(arr); }catch{ alert("File JSON không hợp lệ"); } }}/>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editOpen && editing && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/40" onClick={()=>setEditOpen(false)} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(96vw,640px)] bg-white rounded-2xl shadow-xl ring-1 ring-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="font-bold text-lg">Sửa sản phẩm</div>
              <button onClick={()=>setEditOpen(false)} className="p-2 rounded-lg hover:bg-neutral-100">✕</button>
            </div>
            <form
              className="grid md:grid-cols-5 gap-3"
              onSubmit={(e)=> {
                e.preventDefault();
                const updated: Product = {
                  id: editing.id,
                  name: editName.trim() || editing.name,
                  category: editCategory,
                  price: isFinite(editPrice) ? editPrice : editing.price,
                  rating: isFinite(editRating) ? editRating : editing.rating,
                  image: editImage.trim() || editing.image,
                  badge: editBadge.trim() || undefined,
                };
                setProducts(prev => prev.map(x => x.id === editing.id ? updated : x));
                setEditOpen(false);
              }}
            >
              <input className="border rounded-xl px-3 py-2 md:col-span-2" value={editName} onChange={e=>setEditName(e.target.value)} placeholder="Tên sản phẩm" required/>
              <select className="border rounded-xl px-3 py-2" value={editCategory} onChange={e=>setEditCategory(e.target.value as Category)}>
                <option>Top Up</option><option>Gift Card</option><option>Game Pass</option><option>Bundle</option><option>All</option>
              </select>
              <input type="number" step="100" min="0" className="border rounded-xl px-3 py-2" value={editPrice} onChange={e=>setEditPrice(Number(e.target.value))}/>
              <input type="number" step="0.1" min="0" max="5" className="border rounded-xl px-3 py-2" value={editRating} onChange={e=>setEditRating(Number(e.target.value))}/>
              <input className="border rounded-xl px-3 py-2" value={editBadge} onChange={e=>setEditBadge(e.target.value)} placeholder="Badge (tuỳ chọn)"/>
              <input className="border rounded-xl px-3 py-2 md:col-span-3" value={editImage} onChange={e=>setEditImage(e.target.value)} placeholder="URL ảnh"/>
              <label className="md:col-span-1 px-3 py-2 rounded-xl border text-sm cursor-pointer flex items-center justify-center">
                Upload ảnh
                <input type="file" accept="image/*" className="hidden" onChange={e=>{ const f=e.target.files?.[0]; if (f) setEditImage(URL.createObjectURL(f)); }}/>
              </label>
              <div className="md:col-span-1 flex gap-2">
                <button type="submit" className="flex-1 px-3 py-2 rounded-xl bg-indigo-600 text-white">Lưu</button>
                <button type="button" onClick={()=>setEditOpen(false)} className="px-3 py-2 rounded-xl border">Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== Image Preview Modal (phóng to ảnh) ===== */}
      {preview && (
        <div className="fixed inset-0 z-[70]">
          <div className="absolute inset-0 bg-black/70" onClick={closePreview} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[95vw] max-h-[90vh]">
            <img src={preview.src} alt={preview.alt} className="max-w-[95vw] max-h-[90vh] object-contain rounded-xl shadow-2xl" />
            <button onClick={closePreview} className="absolute -top-4 -right-4 bg-white rounded-full shadow p-2" aria-label="Đóng">✕</button>
          </div>
        </div>
      )}
    </div>
  );
}
