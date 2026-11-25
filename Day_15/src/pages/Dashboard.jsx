import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
    Badge,
    Button,
    Card,
    Col,
    Container,
    Form,
    Row,
    Toast,
    ToastContainer,
} from "react-bootstrap";
import { loadPages, savePage, removePage } from "../features/pages/pageSlice";
import {
    loadNavigation,
    saveNavigation,
} from "../features/navigation/navigationSlice";
import { logout } from "../features/auth/authSlice";
import ComponentEditor, { defaults } from "../components/cms/ComponentEditor";
import PageRenderer from "./PageRenderer";
import { savePageRequest } from "../services/pageService";
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const slugify = (s) =>
    s
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
const fresh = () => ({ id: uid(), type: "hero", props: { ...defaults.hero } });
export default function Dashboard() {
    const dispatch = useDispatch(),
        navigate = useNavigate(),
        { items } = useSelector((s) => s.pages),
        { position } = useSelector((s) => s.navigation);
    const [view, setView] = useState("overview");
    const [editing, setEditing] = useState(null);
    const [componentType, setComponentType] = useState("hero");
    const [selected, setSelected] = useState(null);
    const [toast, setToast] = useState("");
    useEffect(() => {
        dispatch(loadPages());
        dispatch(loadNavigation());
    }, [dispatch]);
    const published = items.filter((p) => p.status === "published"),
        drafts = items.filter((p) => p.status === "draft");
    const startNew = () => {
        setEditing({
            id: uid(),
            pageName: "",
            slug: "",
            navigationLabel: "",
            navigationPosition: position,
            description: "",
            status: "draft",
            components: [],
        });
        setSelected(null);
        setView("builder");
    };
    const editPage = (p) => {
        setEditing({ ...p, components: p.components || [] });
        setSelected(null);
        setView("builder");
    };
    const update = (k, v) => setEditing((p) => ({ ...p, [k]: v }));
    const addComponent = () => {
        const c = {
            id: uid(),
            type: componentType,
            props: { ...defaults[componentType] },
        };
        update("components", [...editing.components, c]);
        setSelected(c.id);
    };
    const changeComponent = (id, props) =>
        update(
            "components",
            editing.components.map((c) => (c.id === id ? { ...c, props } : c)),
        );
    const move = (id, delta) => {
        const arr = [...editing.components],
            i = arr.findIndex((c) => c.id === id),
            j = i + delta;
        if (j < 0 || j >= arr.length) return;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        update("components", arr);
    };
    const publish = async (status) => {
        if (!editing.pageName.trim() || !editing.slug.trim()) {
            setToast("Page name and slug are required.");
            return;
        }
        if (
            items.some(
                (p) =>
                    p.id !== editing.id &&
                    (p.slug === editing.slug ||
                        p.pageName.toLowerCase() === editing.pageName.toLowerCase()),
            )
        ) {
            setToast("A page with this name or slug already exists.");
            return;
        }
        const page = { ...editing, status, updatedAt: new Date().toISOString() };
        try {
            await dispatch(savePage(page)).unwrap();
            setToast(
                status === "published"
                    ? "Page published successfully!"
                    : "Draft saved successfully.",
            );
            if (status === "published") navigate(`/${page.slug}`);
            else setView("pages");
        } catch (e) {
            setToast("Could not save page. Check JSON Server.");
        }
    };
    const deleteOne = async (p) => {
        if (confirm(`Delete "${p.pageName}"?`)) {
            await dispatch(removePage(p.id));
            setToast("Page deleted.");
        }
    };
    const saveNav = async (value) => {
        try {
            await dispatch(saveNavigation(value)).unwrap();

            setToast(
                value === "top"
                    ? "Top navbar activated successfully!"
                    : "Left sidebar activated successfully!"
            );
        } catch (error) {
            console.error("Navigation update failed:", error);
            setToast("Failed to update navigation. Check JSON Server.");
        }
    };
    const selectedComponent = editing?.components.find((c) => c.id === selected);
    return (
        <div className="admin-shell">
            <aside className="admin-sidebar">
                <Link to="/" className="brand">
                    ✳ ORBIT
                </Link>
                <div className="sidebar-caption">WORKSPACE</div>
                {[
                    ["overview", "◫", "Overview"],
                    ["builder", "＋", "Create page"],
                    ["pages", "▤", "Manage pages"],
                    ["published", "↗", "Published"],
                    ["drafts", "◷", "Drafts"],
                ].map(([id, ico, label]) => (
                    <button
                        key={id}
                        className={`side-link ${view === id ? "active" : ""}`}
                        onClick={() => (id === "builder" ? startNew() : setView(id))}
                    >
                        <span>{ico}</span>
                        {label}
                    </button>
                ))}
                <div className="sidebar-bottom">
                    <button
                        className="side-link"
                        onClick={() => {
                            dispatch(logout());
                            navigate("/");
                        }}
                    >
                        ↪ Log out
                    </button>
                </div>
            </aside>
            <main className="admin-main">
                <header className="admin-topbar">
                    <div>
                        <span className="eyebrow">CONTENT STUDIO</span>
                        <h4 className="mb-0">
                            {view === "builder"
                                ? "Page builder"
                                : view === "overview"
                                    ? "Overview"
                                    : view[0].toUpperCase() + view.slice(1)}
                        </h4>
                    </div>
                    <div className="d-flex gap-2">
                        <Button className="rounded-pill" onClick={startNew}>
                            ＋ New page
                        </Button>
                    </div>
                </header>
                {view === "overview" && (
                    <>
                        <div className="welcome-panel">
                            <span className="eyebrow">YOUR CONTENT, YOUR CANVAS</span>
                            <h1>
                                Make something
                                <br />
                                <em>worth scrolling.</em>
                            </h1>
                            <p>
                                Build pages from reusable blocks.
                            </p>
                            <Button
                                variant="light"
                                className="rounded-pill px-4"
                                onClick={startNew}
                            >
                                Create a page ↗
                            </Button>
                        </div>
                        <Row className="g-3 my-3">
                            {[
                                ["Total pages", items.length],
                                ["Published", published.length],
                                ["Drafts", drafts.length],
                            ].map(([label, n]) => (
                                <Col md={4} key={label}>
                                    <Card className="stat-card border-0">
                                        <Card.Body>
                                            <div className="text-secondary">{label}</div>
                                            <div className="display-5 fw-bold">{n}</div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                        <Card className="border-0 shadow-sm p-3">
                            <Card.Body>
                                <div className="d-flex justify-content-between">
                                    <h5>Recent pages</h5>
                                    <Button variant="link" onClick={() => setView("pages")}>
                                        View all
                                    </Button>
                                </div>
                                {items
                                    .slice(-5)
                                    .reverse()
                                    .map((p) => (
                                        <div className="page-row" key={p.id}>
                                            <div>
                                                <b>{p.pageName}</b>
                                                <div className="small text-secondary">/{p.slug}</div>
                                            </div>
                                            <Badge
                                                bg={p.status === "published" ? "success" : "secondary"}
                                            >
                                                {p.status}
                                            </Badge>
                                            <Button
                                                size="sm"
                                                variant="outline-secondary"
                                                onClick={() => editPage(p)}
                                            >
                                                Edit
                                            </Button>
                                        </div>
                                    ))}
                                {!items.length && (
                                    <p className="text-secondary">
                                        No pages yet. Create your first one.
                                    </p>
                                )}
                            </Card.Body>
                        </Card>
                    </>
                )}
                {(view === "pages" || view === "published" || view === "drafts") && (
                    <Card className="border-0 shadow-sm p-3">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <h5>Pages library</h5>
                                    <small className="text-secondary">
                                        Create as many pages as your site needs.
                                    </small>
                                </div>
                                <Button onClick={startNew}>＋ Create page</Button>
                            </div>
                            {(view === "published"
                                ? published
                                : view === "drafts"
                                    ? drafts
                                    : items
                            ).map((p) => (
                                <div className="page-row" key={p.id}>
                                    <div>
                                        <b>{p.pageName}</b>
                                        <div className="small text-secondary">
                                            /{p.slug} · {p.components?.length || 0} blocks
                                        </div>
                                    </div>
                                    <Badge
                                        bg={p.status === "published" ? "success" : "secondary"}
                                    >
                                        {p.status}
                                    </Badge>
                                    <Button
                                        size="sm"
                                        variant="outline-primary"
                                        onClick={() => editPage(p)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline-danger"
                                        onClick={() => deleteOne(p)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            ))}
                        </Card.Body>
                    </Card>
                )}
                {view === "builder" && editing && (
                    <>
                        <Row className="g-3">
                            <Col xl={5}>
                                <Card className="border-0 shadow-sm">
                                    <Card.Body>
                                        <div className="d-flex justify-content-between">
                                            <h5>Page settings</h5>
                                            <Badge bg="dark">{editing.status}</Badge>
                                        </div>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Page name</Form.Label>
                                            <Form.Control
                                                value={editing.pageName}
                                                onChange={(e) => {
                                                    const v = e.target.value;
                                                    update("pageName", v);
                                                    if (
                                                        !editing.slug ||
                                                        editing.slug === slugify(editing.pageName)
                                                    )
                                                        update("slug", slugify(v));
                                                }}
                                                placeholder="e.g. Product"
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Page slug</Form.Label>
                                            <Form.Control
                                                value={editing.slug}
                                                onChange={(e) =>
                                                    update("slug", slugify(e.target.value))
                                                }
                                            />
                                            <Form.Text>
                                                Public URL: /{editing.slug || "your-page"}
                                            </Form.Text>
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Navigation label</Form.Label>
                                            <Form.Control
                                                value={editing.navigationLabel}
                                                onChange={(e) =>
                                                    update("navigationLabel", e.target.value)
                                                }
                                                placeholder="e.g. Products"
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Navigation position</Form.Label>
                                            <Form.Select
                                                value={editing.navigationPosition || position}
                                                onChange={(e) =>
                                                    update("navigationPosition", e.target.value)
                                                }
                                            >
                                                <option value="top">Top navbar</option>
                                                <option value="left">Left sidebar</option>
                                            </Form.Select>
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Description</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={2}
                                                value={editing.description}
                                                onChange={(e) => update("description", e.target.value)}
                                            />
                                        </Form.Group>
                                        <hr />
                                        <h5>Composable blocks</h5>
                                        <div className="d-flex gap-2">
                                            <Form.Select
                                                value={componentType}
                                                onChange={(e) => setComponentType(e.target.value)}
                                            >
                                                {Object.keys(defaults).map((t) => (
                                                    <option key={t} value={t}>
                                                        {t[0].toUpperCase() + t.slice(1)}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                            <Button onClick={addComponent}>Add +</Button>
                                        </div>
                                        {editing.components.map((c, i) => (
                                            <div
                                                className={`component-row ${selected === c.id ? "chosen" : ""}`}
                                                key={c.id}
                                                onClick={() => setSelected(c.id)}
                                            >
                                                <div>
                                                    <b>
                                                        {i + 1}. {c.type}
                                                    </b>
                                                    <div className="small text-secondary">
                                                        Reusable {c.type} block
                                                    </div>
                                                </div>
                                                <div className="d-flex gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="light"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            move(c.id, -1);
                                                        }}
                                                    >
                                                        ↑
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="light"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            move(c.id, 1);
                                                        }}
                                                    >
                                                        ↓
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline-danger"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            update(
                                                                "components",
                                                                editing.components.filter((x) => x.id !== c.id),
                                                            );
                                                            if (selected === c.id) setSelected(null);
                                                        }}
                                                    >
                                                        ×
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                        {selectedComponent && (
                                            <>
                                                <hr />
                                                <div className="d-flex justify-content-between">
                                                    <h5>Edit {selectedComponent.type}</h5>
                                                    <Button
                                                        size="sm"
                                                        variant="link"
                                                        onClick={() => setSelected(null)}
                                                    >
                                                        Close
                                                    </Button>
                                                </div>
                                                <ComponentEditor
                                                    type={selectedComponent.type}
                                                    value={selectedComponent.props}
                                                    onChange={(props) => changeComponent(selected, props)}
                                                />
                                            </>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col xl={7}>
                                <Card className="border-0 shadow-sm preview-card">
                                    <Card.Body>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <div>
                                                <span className="eyebrow">LIVE CANVAS</span>
                                                <h5 className="mb-0">
                                                    {editing.pageName || "Untitled page"}
                                                </h5>
                                            </div>
                                            <Badge bg="success">● Live preview</Badge>
                                        </div>
                                        <div className="preview-frame">
                                            <PageRenderer page={editing} />
                                            {!editing.components.length && (
                                                <div className="empty-data">
                                                    Add a block to see your page come to life.
                                                </div>
                                            )}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                        <div className="builder-actions">
                            <Button
                                variant="outline-secondary"
                                onClick={() => setView("pages")}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="outline-primary"
                                onClick={() => publish("draft")}
                            >
                                Save draft
                            </Button>
                            <Button onClick={() => publish("published")}>
                                Publish page ↗
                            </Button>
                        </div>
                    </>
                )}
                {view === "overview" && (
                    <Card className="border-0 shadow-sm mt-3">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h5>Public navigation</h5>
                                    <p className="text-secondary mb-0">
                                        Choose how published pages are presented.
                                    </p>
                                </div>
                                <Form.Select
                                    style={{ maxWidth: 190 }}
                                    value={position}
                                    onChange={(e) => saveNav(e.target.value)}
                                >
                                    <option value="top">Top navbar</option>
                                    <option value="left">Left sidebar</option>
                                </Form.Select>
                            </div>
                        </Card.Body>
                    </Card>
                )}
            </main>
            <ToastContainer position="bottom-end" className="p-3">
                <Toast
                    bg="dark"
                    show={!!toast}
                    onClose={() => setToast("")}
                    delay={3000}
                    autohide
                >
                    <Toast.Body className="text-white">{toast}</Toast.Body>
                </Toast>
            </ToastContainer>
        </div>
    );
}
