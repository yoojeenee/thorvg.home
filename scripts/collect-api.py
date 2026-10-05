#!/usr/bin/env python3
"""Collect ThorVG API reference data for the docs site.

Reads three sources and writes one folder per language:

    C++   <thorvg>/inc/thorvg.h
    C     <thorvg>/src/bindings/capi/thorvg_capi.h
    JS    <webcanvas>/packages/webcanvas/src/**/*.ts

Output:

    assets/data/api/<lang>/index.json   groups and summaries
    assets/data/api/<lang>/<Name>.json  one entity per struct, class, enum or group

Usage:
    python3 scripts/collect-api.py
    python3 scripts/collect-api.py --thorvg /path/to/thorvg-main --webcanvas /path/to/thorvg.web-main
    python3 scripts/collect-api.py --lang cpp      # only one language

Every run replaces the output folders, so re-run this after the upstream sources change.
"""
import argparse
import json
import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_THORVG = Path("/Users/yiu/Downloads/thorvg-main")
DEFAULT_WEBCANVAS = Path("/Users/yiu/Downloads/thorvg.web-main/packages/webcanvas")
DEFAULT_OUT = REPO_ROOT / "assets" / "data" / "api"

CPP_HEADER = Path("inc") / "thorvg.h"
C_HEADER = Path("src") / "bindings" / "capi" / "thorvg_capi.h"
JS_SOURCE_DIR = Path("src")

# One grouping shared by every language, so the same entity lands in the same group.
GROUP_ORDER = ["Core", "Drawing", "Gradients", "Canvas", "Animation", "System"]
ENTITY_GROUP = {
    "Paint": "Core",
    "Fill": "Core",
    "Shape": "Drawing",
    "Picture": "Drawing",
    "Scene": "Drawing",
    "Text": "Drawing",
    "Font": "Drawing",
    "FontsourceProvider": "Drawing",
    "LinearGradient": "Gradients",
    "RadialGradient": "Gradients",
    "ConicGradient": "Gradients",
    "Canvas": "Canvas",
    "SwCanvas": "Canvas",
    "GlCanvas": "Canvas",
    "WgCanvas": "Canvas",
    "Animation": "Animation",
    "LottieAnimation": "Animation",
    "Video": "Animation",
    "Initializer": "System",
    "Saver": "System",
    "Accessor": "System",
    "init": "System",
    "InitOptions": "System",
    "getGlobalRenderer": "System",
}

# C functions are flat, so entities are formed by name prefix. Longer prefixes first.
C_PREFIXES = [
    ("tvg_engine_", "Initializer"),
    ("tvg_swcanvas_", "SwCanvas"),
    ("tvg_glcanvas_", "GlCanvas"),
    ("tvg_wgcanvas_", "WgCanvas"),
    ("tvg_canvas_", "Canvas"),
    ("tvg_linear_gradient_", "LinearGradient"),
    ("tvg_radial_gradient_", "RadialGradient"),
    ("tvg_conic_gradient_", "ConicGradient"),
    ("tvg_gradient_", "Fill"),
    ("tvg_shape_", "Shape"),
    ("tvg_picture_", "Picture"),
    ("tvg_scene_", "Scene"),
    ("tvg_text_", "Text"),
    ("tvg_font_", "Font"),
    ("tvg_paint_", "Paint"),
    ("tvg_animation_", "Animation"),
    ("tvg_lottie_", "LottieAnimation"),
    ("tvg_saver_", "Saver"),
    ("tvg_accessor_", "Accessor"),
    ("tvg_video_", "Video"),
]

OTHER_GROUP = "Other"
TYPES_GROUP = "Types"

DOXYGEN_TAGS = {
    "brief", "param", "retval", "return", "returns", "note", "warning",
    "see", "since", "deprecated", "class", "ingroup", "sa", "attention", "remark",
    "defgroup", "addtogroup",
}
JSDOC_TAGS = {"param", "returns", "return", "example", "category", "throws", "deprecated", "see", "since", "remarks", "note"}

IDENT_RE = re.compile(r"[A-Za-z_]\w*")


def normalize(s):
    return re.sub(r"\s+", " ", s).strip()


def inline_markup(s):
    s = re.sub(r"\{@link(?:code)?\s+([^}\s|]+)[^}]*\}", r"`\1`", s)
    s = re.sub(r"@(?:c|p|a)\s+([A-Za-z_]\w*(?:(?:::|\.)\w+)*)", r"`\1`", s)
    s = re.sub(r"@ref\s+(\S+)", r"\1", s)
    s = re.sub(r"@(?:link|endlink)\b", "", s)
    s = re.sub(r"@b\s+(\S+)", r"**\1**", s)
    s = re.sub(r"\\(?:p|c)\s+([A-Za-z_]\w*(?:(?:::|\.)\w+)*)", r"`\1`", s)
    return s.strip()


def paragraphs(lines):
    out, current = [], []
    for line in lines:
        if line.strip():
            current.append(line.strip())
        elif current:
            out.append(inline_markup(" ".join(current)))
            current = []
    if current:
        out.append(inline_markup(" ".join(current)))
    return out


def empty_doc():
    return {
        "brief": "", "description": [], "params": [], "returns": None,
        "retvals": [], "notes": [], "warnings": [], "see": [],
        "since": None, "deprecated": None, "experimental": False,
        "examples": [], "category": None,
    }


def finalize_doc(result, brief_paras, desc_paras):
    result["brief"] = brief_paras[0] if brief_paras else (desc_paras.pop(0) if desc_paras else "")
    result["description"] = desc_paras
    result["experimental"] = any("experimental" in note.lower() for note in result["notes"])
    return result


def parse_doxygen(raw):
    """Parse the body of a /** ... */ block that uses Doxygen tags."""
    result = empty_doc()
    if not raw:
        return result
    lines = [re.sub(r"^\s*\*\s?", "", line).rstrip() for line in raw.split("\n")]

    sections = [("_desc", None, [])]
    for line in lines:
        stripped = line.strip()
        m = re.match(r"@(\w+)(?:\[([^\]]*)\])?\s*(.*)$", stripped)
        if m and m.group(1) in DOXYGEN_TAGS:
            sections.append((m.group(1), m.group(2), [m.group(3)]))
        else:
            sections[-1][2].append(line)

    brief_paras, desc_paras = [], []
    for tag, arg, body in sections:
        if tag == "_desc":
            desc_paras += paragraphs(body)
        elif tag == "brief":
            paras = paragraphs(body)
            if paras:
                brief_paras.append(paras[0])
                desc_paras += paras[1:]
        elif tag == "param":
            paras = paragraphs(body)
            if paras:
                head, _, rest = paras[0].partition(" ")
                result["params"].append({
                    "name": head,
                    "direction": (arg or "in").replace(" ", ""),
                    "description": " ".join([rest] + paras[1:]).strip(),
                })
        elif tag == "retval":
            paras = paragraphs(body)
            if paras:
                head, _, rest = paras[0].partition(" ")
                result["retvals"].append({"value": head, "description": " ".join([rest] + paras[1:]).strip()})
        elif tag in ("return", "returns"):
            result["returns"] = " ".join(paragraphs(body)).strip() or None
        elif tag == "note":
            text = " ".join(paragraphs(body)).strip()
            if re.fullmatch(r"\d+(?:\.\d+)*", text):
                result["since"] = result["since"] or text
            else:
                result["notes"] += paragraphs(body)
        elif tag == "warning":
            result["warnings"] += paragraphs(body)
        elif tag == "see":
            for item in re.split(r"[\n,]", " ".join(body)):
                item = inline_markup(normalize(item))
                if item:
                    result["see"].append(item)
        elif tag == "since":
            result["since"] = normalize(" ".join(body)) or None
        elif tag == "deprecated":
            result["deprecated"] = " ".join(paragraphs(body)).strip() or "deprecated"
    return finalize_doc(result, brief_paras, desc_paras)


def parse_jsdoc(raw):
    """Parse the body of a TSDoc / JSDoc block. Fenced code in @example is kept verbatim."""
    result = empty_doc()
    if not raw:
        return result
    lines = [re.sub(r"^\s*\*\s?", "", line).rstrip() for line in raw.split("\n")]

    sections = [("_desc", None, [])]
    in_fence = False
    for line in lines:
        stripped = line.strip()
        if in_fence:
            sections[-1][2].append(line)
            if stripped.startswith("```"):
                in_fence = False
            continue
        if stripped.startswith("```"):
            in_fence = True
            sections[-1][2].append(line)
            continue
        m = re.match(r"@(\w+)\s*(.*)$", stripped)
        if m and m.group(1) in JSDOC_TAGS:
            sections.append((m.group(1), None, [m.group(2)]))
        else:
            sections[-1][2].append(line)

    brief_paras, desc_paras = [], []
    for tag, _, body in sections:
        if tag == "_desc":
            desc_paras += paragraphs(body)
        elif tag == "param":
            text = " ".join(body).strip()
            text = re.sub(r"^\{[^}]*\}\s*", "", text)
            m = re.match(r"^\[?([\w$.]+)\]?\s*(?:-\s*)?(.*)$", text)
            if m:
                result["params"].append({"name": m.group(1), "direction": None, "description": inline_markup(m.group(2).strip())})
        elif tag in ("returns", "return"):
            result["returns"] = " ".join(paragraphs(body)).strip() or None
        elif tag == "example":
            code = "\n".join(line for line in body).strip()
            fenced = re.sub(r"^```\w*\n?|\n?```$", "", code, flags=re.M).strip()
            if fenced:
                result["examples"].append(fenced)
        elif tag == "category":
            result["category"] = normalize(re.sub(r"@\w+", "", " ".join(body))) or None
        elif tag == "note":
            result["notes"] += paragraphs(body)
        elif tag == "deprecated":
            result["deprecated"] = " ".join(paragraphs(body)).strip() or "deprecated"
        elif tag == "since":
            result["since"] = normalize(" ".join(body)) or None
        elif tag == "see":
            for item in re.split(r"[\n,]", " ".join(body)):
                item = inline_markup(normalize(item))
                if item:
                    result["see"].append(item)
        elif tag == "throws":
            result["warnings"] += paragraphs(body)
    return finalize_doc(result, brief_paras, desc_paras)


def line_of(text, pos):
    return text.count("\n", 0, pos) + 1


# ---------------------------------------------------------------------------
# C++ (inc/thorvg.h): nested struct, class and enum declarations
# ---------------------------------------------------------------------------

TYPE_HEAD_RE = re.compile(r"^(enum\s+struct|enum\s+class|enum|struct|class)\b")


class CppContext:
    def __init__(self, kind, record=None, access="public"):
        self.kind = kind
        self.record = record
        self.access = access
        self.buf = []
        self.pending_doc = None
        self.pending_trailing = []
        self.last_item = None
        self.paren = 0


class CppParser:
    def __init__(self, text):
        self.text = text
        self.root_records = []
        self.stack = [CppContext("namespace")]

    @property
    def ctx(self):
        return self.stack[-1]

    def run(self, start):
        text, n = self.text, len(self.text)
        i = start
        at_line_start = True
        while i < n:
            c = text[i]
            two = text[i:i + 2]

            if c == "\n":
                at_line_start = True
                i += 1
                continue
            if at_line_start and c in " \t":
                i += 1
                continue
            if at_line_start and c == "#":
                while i < n:
                    eol = text.find("\n", i)
                    if eol == -1:
                        i = n
                        break
                    continued = text[eol - 1] == "\\"
                    i = eol + 1
                    if not continued:
                        break
                continue
            at_line_start = False

            if two == "//":
                eol = text.find("\n", i)
                eol = n if eol == -1 else eol
                line = text[i:eol]
                if line.startswith("///<") or line.startswith("//!<"):
                    self.attach_trailing(line[4:].strip())
                i = eol
                continue
            if two == "/*":
                end = text.find("*/", i + 2)
                end = n if end == -1 else end
                body = text[i + 2:end]
                if body.startswith("*<") or body.startswith("!<"):
                    self.attach_trailing(body[2:].strip())
                elif body.startswith("*") or body.startswith("!"):
                    self.ctx.pending_doc = body[1:]
                i = end + 2
                continue
            if c in "\"'":
                j = i + 1
                while j < n and text[j] != c:
                    j += 2 if text[j] == "\\" else 1
                self.ctx.buf.append(text[i:j + 1])
                i = j + 1
                continue

            if c == "(":
                self.ctx.paren += 1
            elif c == ")":
                self.ctx.paren -= 1

            if c == "{":
                i = self.open_brace(i)
                continue
            if c == "}":
                self.close_brace()
                i += 1
                continue
            if c == ";":
                self.end_statement(i)
                i += 1
                continue
            if c == "," and self.ctx.kind == "enum" and self.ctx.paren == 0:
                self.finish_enumerator(i)
                i += 1
                continue
            if c == ":" and two != "::" and text[i - 1:i] != ":":
                label = normalize("".join(self.ctx.buf))
                if self.ctx.kind == "type" and label in ("public", "private", "protected"):
                    self.ctx.access = label
                    self.ctx.buf = []
                    self.ctx.pending_doc = None
                    i += 1
                    continue

            self.ctx.buf.append(c)
            i += 1

    def attach_trailing(self, txt):
        ctx = self.ctx
        if normalize("".join(ctx.buf)):
            ctx.pending_trailing.append(txt)
        elif ctx.last_item is not None:
            ctx.last_item["trailing"] = " ".join(filter(None, [ctx.last_item.get("trailing", ""), txt]))

    def open_brace(self, pos):
        ctx = self.ctx
        decl = normalize("".join(ctx.buf))
        if TYPE_HEAD_RE.match(decl.replace("TVG_API", " ").strip()):
            self.push_type(decl, pos)
            return pos + 1
        if decl.startswith("namespace") or not decl:
            ctx.buf = []
            self.stack.append(CppContext("block"))
            return pos + 1
        if ctx.kind == "type" and "(" in decl:
            self.finish_member(decl, pos)
            depth, j, text = 0, pos, self.text
            while j < len(text):
                if text[j] == "{":
                    depth += 1
                elif text[j] == "}":
                    depth -= 1
                    if depth == 0:
                        break
                j += 1
            return j + 1
        self.stack.append(CppContext("block"))
        ctx.buf = []
        return pos + 1

    def push_type(self, decl, pos):
        parent = self.ctx
        cleaned = normalize(decl.replace("TVG_API", " "))
        is_enum = cleaned.startswith("enum")
        after_keyword = re.sub(r"^(enum\s+struct|enum\s+class|enum|struct|class)\s*", "", cleaned)
        name_match = IDENT_RE.match(after_keyword)
        name = name_match.group(0) if name_match else "?"
        base = None
        if not is_enum and ":" in after_keyword:
            base_ids = IDENT_RE.findall(after_keyword.split(":", 1)[1].replace("final", ""))
            base = base_ids[0] if base_ids else None
        final = bool(re.search(r"\bfinal\b", cleaned))

        record = {
            "name": name,
            "kind": "enum" if is_enum else "struct",
            "base": base,
            "final": final,
            "line": line_of(self.text, pos),
            "doc": parse_doxygen(parent.pending_doc),
            "members": [],
            "nested": [],
        }
        parent.pending_doc = None
        visible = parent.kind == "namespace" or parent.access == "public"
        if parent.kind == "namespace":
            self.root_records.append(record)
        elif parent.kind == "type" and visible:
            parent.record["nested"].append(record)

        ctx = CppContext("enum" if is_enum else "type", record, access="public")
        if not visible:
            ctx.access = "private"
        self.stack.append(ctx)
        parent.buf = []

    def close_brace(self):
        ctx = self.ctx
        if ctx.kind == "enum" and normalize("".join(ctx.buf)):
            self.finish_enumerator(None)
        if len(self.stack) > 1:
            self.stack.pop()
        self.ctx.buf = []
        self.ctx.pending_doc = None

    def end_statement(self, pos):
        ctx = self.ctx
        if ctx.kind == "type":
            text = normalize("".join(ctx.buf))
            if text:
                self.finish_member(text, pos)
        ctx.buf = []
        ctx.pending_doc = None

    def finish_enumerator(self, pos):
        ctx = self.ctx
        raw = normalize("".join(ctx.buf))
        ctx.buf = []
        if not raw:
            return
        name, _, value = raw.partition("=")
        item = {
            "kind": "enumerator",
            "line": line_of(self.text, pos) if pos is not None else 0,
            "name": normalize(name),
            "value": normalize(value) or None,
            "trailing": "",
            "doc": parse_doxygen(ctx.pending_doc),
        }
        if ctx.pending_trailing:
            item["trailing"] = " ".join(ctx.pending_trailing)
            ctx.pending_trailing = []
        ctx.pending_doc = None
        ctx.record["members"].append(item)
        ctx.last_item = item

    def finish_member(self, text, pos):
        ctx = self.ctx
        doc_raw = ctx.pending_doc
        trailing = " ".join(ctx.pending_trailing)
        ctx.pending_doc = None
        ctx.pending_trailing = []
        ctx.buf = []

        if ctx.access != "public" or not text:
            return
        if re.match(r"^(struct|class|enum|using|typedef|friend|static_assert)\b", text):
            return
        if "_TVG_" in text or text.startswith("_"):
            return

        member = {"line": line_of(self.text, pos), "signature": text, "trailing": trailing}
        member["doc"] = parse_doxygen(doc_raw)

        if "(" in text:
            head = text.split("(", 1)[0].strip()
            name_m = re.search(r"(operator\s*\S+|~?\w+)\s*$", head)
            name = normalize(name_m.group(1)) if name_m else head
            if name.startswith("~"):
                member["kind"] = "destructor"
            elif name == ctx.record["name"]:
                member["kind"] = "constructor"
            else:
                member["kind"] = "method"
            member["name"] = name
            member["static"] = bool(re.match(r"^static\b", text)) or " static " in text
            member["virtual"] = bool(re.match(r"^virtual\b", text))
            member["pure"] = "= 0" in text
            member["deleted"] = "= delete" in text
            member["noexcept"] = "noexcept" in text
            member["const"] = bool(re.search(r"\)\s*const\b", text))
        else:
            head = text.split("=", 1)[0].strip()
            ids = IDENT_RE.findall(head)
            if not ids:
                return
            member["kind"] = "field"
            member["name"] = ids[-1]
            member["type"] = normalize(head[: head.rfind(ids[-1])])
            member["static"] = head.startswith("static")

        if member.get("deleted"):
            return
        ctx.record["members"].append(member)
        ctx.last_item = member


def parse_trailing(text):
    """Split an inline `///<` comment into brief text and inline @since / @note tags."""
    since_m = re.search(r"@since\s+(\S+)", text)
    note_m = re.search(r"@note\s+(.*)$", text)
    brief = inline_markup(re.sub(r"@(since|note)\b.*$", "", text).strip())
    return {
        "brief": brief,
        "since": since_m.group(1) if since_m else None,
        "experimental": bool(note_m and "experimental" in note_m.group(1).lower()),
    }


def cpp_member_entry(member):
    doc = member.get("doc") or empty_doc()
    base = {"name": member["name"], "kind": member["kind"], "line": member["line"]}
    if member["kind"] in ("enumerator", "field"):
        trailing = parse_trailing(member.get("trailing", ""))
        base.update({
            "value": member.get("value"),
            "type": member.get("type", ""),
            "static": member.get("static", False),
            "brief": doc["brief"] or trailing["brief"],
            "description": doc["description"],
            "since": doc["since"] or trailing["since"],
            "experimental": doc["experimental"] or trailing["experimental"],
        })
        return base
    base.update({
        "signature": normalize(member["signature"]),
        "static": member.get("static", False),
        "virtual": member.get("virtual", False),
        "pure": member.get("pure", False),
        "const": member.get("const", False),
        "noexcept": member.get("noexcept", False),
        "brief": doc["brief"],
        "description": doc["description"],
        "params": doc["params"],
        "returns": doc["returns"],
        "retvals": doc["retvals"],
        "notes": doc["notes"],
        "warnings": doc["warnings"],
        "see": doc["see"],
        "since": doc["since"],
        "deprecated": doc["deprecated"],
        "experimental": doc["experimental"],
    })
    return base


def cpp_record_entry(record, source_rel):
    doc = record["doc"]
    members = [cpp_member_entry(m) for m in record["members"] if m["kind"] != "field" or True]
    return {
        "name": record["name"],
        "kind": record["kind"],
        "base": record["base"],
        "final": record["final"],
        "brief": doc["brief"],
        "description": doc["description"],
        "since": doc["since"],
        "deprecated": doc["deprecated"],
        "experimental": doc["experimental"],
        "notes": doc["notes"],
        "warnings": doc["warnings"],
        "see": doc["see"],
        "source": f"{source_rel}:{record['line']}",
        "members": members,
        "nested": [cpp_record_entry(n, source_rel) for n in record["nested"]],
    }


def collect_cpp(source_root):
    header = source_root / CPP_HEADER
    text = header.read_text(encoding="utf-8")
    namespace = re.search(r"^namespace\s+tvg\s*\{", text, re.M)
    if not namespace:
        raise SystemExit(f"namespace tvg not found in {header}")
    parser = CppParser(text)
    parser.run(namespace.end())
    source_rel = CPP_HEADER.as_posix()
    entities = [cpp_record_entry(r, source_rel) for r in parser.root_records]
    entities = [e for e in entities if e["name"] != "?"]
    version = read_c_version(text)
    return entities, version, source_rel


def read_c_version(text):
    parts = []
    for name in ("MAJOR", "MINOR", "MICRO"):
        m = re.search(rf"#define\s+TVG_VERSION_{name}\s+(\d+)", text)
        parts.append(m.group(1) if m else "0")
    return ".".join(parts)


DOC_BLOCK_RE = re.compile(r"/\*\*(?![<\*/]).*?\*/", re.S)
FUNCTION_RE = re.compile(r"^\s*TVG_API\s+(?P<sig>[^;{]*?\b(?P<name>tvg_\w+)\s*\((?P<args>[^)]*)\))\s*;", re.S)
TYPEDEF_BLOCK_RE = re.compile(r"^\s*typedef\s+(?P<kind>enum|struct)\s*\w*\s*\{(?P<body>.*?)\}\s*(?P<name>\w+)\s*;", re.S)
TYPEDEF_HANDLE_RE = re.compile(r"^\s*typedef\s+struct\s+\w+\s*\*\s*(?P<name>\w+)\s*;")
TYPEDEF_ALIAS_RE = re.compile(r"^\s*typedef\s+(?P<type>[\w ]+?)\s+(?P<name>\w+)\s*;")


def strip_line_comments(segment):
    """Remove // and /* */ comments but keep the text of trailing `///<` docs per line."""
    trailing = {}
    out_lines = []
    for idx, line in enumerate(segment.split("\n")):
        m = re.search(r"//[/!]?<?\s*(.*)$", line)
        if m and (line[m.start():].startswith("///<") or line[m.start():].startswith("//!<")):
            trailing[idx] = m.group(1).strip()
            line = line[:m.start()]
        elif m:
            line = line[:m.start()]
        out_lines.append(line)
    return "\n".join(out_lines), trailing


def c_function_entry(match, doc_raw, line_no):
    sig = normalize(match.group("sig"))
    params = []
    doc = parse_doxygen(doc_raw)
    for arg in match.group("args").split(","):
        arg = normalize(arg)
        if not arg or arg == "void":
            continue
        name_m = re.search(r"(\w+)\s*(\[\s*\w*\s*\])?$", arg)
        pname = name_m.group(1) if name_m else arg
        pdoc = next((p for p in doc["params"] if p["name"] == pname), None)
        params.append({"name": pname, "type": normalize(arg[: arg.rfind(pname)]) if name_m else "", "description": pdoc["description"] if pdoc else ""})
    return {
        "name": match.group("name"),
        "kind": "function",
        "line": line_no,
        "signature": sig,
        "brief": doc["brief"],
        "description": doc["description"],
        "params": params,
        "returns": doc["returns"],
        "retvals": doc["retvals"],
        "notes": doc["notes"],
        "warnings": doc["warnings"],
        "see": doc["see"],
        "since": doc["since"],
        "deprecated": doc["deprecated"],
        "experimental": doc["experimental"],
    }


def split_trailing(raw):
    """Split a C member line into its code and the text of a trailing `///<` or `/**<` doc."""
    m = re.search(r"(?://[/!]<|/\*\*<|/\*!<)\s*(.*?)(?:\*/)?\s*$", raw)
    if not m:
        return re.sub(r"//.*$", "", raw), ""
    return re.sub(r"//.*$", "", raw[:m.start()]), m.group(1).strip()


def c_enum_members(body, base_line):
    items = []
    for idx, raw in enumerate(body.split("\n")):
        code, trailing_text = split_trailing(raw)
        code = re.sub(r"/\*.*?\*/", "", code).strip().rstrip(",").strip()
        if not code:
            continue
        name, _, value = code.partition("=")
        name = normalize(name)
        if not re.match(r"^\w+$", name):
            continue
        trailing = parse_trailing(trailing_text) if trailing_text else {"brief": "", "since": None, "experimental": False}
        items.append({
            "name": name,
            "value": normalize(value) or None,
            "brief": trailing["brief"],
            "since": trailing["since"],
            "experimental": trailing["experimental"],
            "line": base_line + idx,
        })
    return items


def c_struct_fields(body, base_line):
    fields = []
    for idx, raw in enumerate(body.split("\n")):
        code, trailing_text = split_trailing(raw)
        decl = re.sub(r"/\*.*?\*/", "", code).strip()
        if not decl.endswith(";"):
            continue
        decl = decl[:-1].strip()
        if "," in decl:
            names = [n.strip() for n in decl.split(",")]
            base_type_m = re.match(r"^(.*?)\s*(\*?\s*\w+)$", names[0])
            if not base_type_m:
                continue
            ctype = base_type_m.group(1)
            names = [base_type_m.group(2)] + names[1:]
        else:
            m = re.match(r"^(.*?)\s*(\*?\s*\w+)$", decl)
            if not m:
                continue
            ctype, names = m.group(1), [m.group(2)]
        trailing = parse_trailing(trailing_text) if trailing_text else {"brief": "", "since": None, "experimental": False}
        for name in names:
            fields.append({
                "name": name.strip().lstrip("*").strip(),
                "type": normalize(ctype),
                "brief": trailing["brief"],
                "since": trailing["since"],
                "experimental": trailing["experimental"],
                "line": base_line + idx,
            })
    return fields


def c_prefix_entity(function_name):
    for prefix, entity in C_PREFIXES:
        if function_name.startswith(prefix):
            return entity
    return OTHER_GROUP


def collect_c(source_root):
    header = source_root / C_HEADER
    text = header.read_text(encoding="utf-8")
    source_rel = C_HEADER.as_posix()
    version = read_c_version(text)

    blocks = []
    for m in DOC_BLOCK_RE.finditer(text):
        next_start = len(text)
        nxt = DOC_BLOCK_RE.search(text, m.end())
        if nxt:
            next_start = nxt.start()
        segment = text[m.end():next_start]
        blocks.append((m.group(0)[3:-2], m.end(), segment))

    functions = {}
    types = []
    for doc_body, seg_start, segment in blocks:
        doc_text = doc_body
        if re.match(r"^\s*(\\\}|@defgroup|@addtogroup|@\{|@\})", doc_text.strip()) and "@brief" not in doc_text:
            continue
        code, _ = strip_line_comments(segment)
        code_stripped = code.lstrip()

        fm = FUNCTION_RE.match(code)
        if fm:
            entity = c_function_entry(fm, doc_body, line_of(text, seg_start))
            functions.setdefault(c_prefix_entity(entity["name"]), []).append(entity)
            continue

        tm = TYPEDEF_BLOCK_RE.match(code)
        if tm:
            body_start = segment.find("{") + 1
            body_line = line_of(text, seg_start) + segment[:body_start].count("\n")
            body_raw = segment[body_start: segment.find("}", body_start)]
            body_code = strip_line_comments(body_raw)[0]
            trailing_map = {}
            raw_lines = body_raw.split("\n")
            for idx, raw in enumerate(raw_lines):
                tr = re.search(r"///<\s*(.*)$", raw)
                if tr:
                    trailing_map[idx] = tr.group(1)
            members = c_enum_members(body_raw, body_line) if tm.group("kind") == "enum" else c_struct_fields(body_raw, body_line)
            if tm.group("kind") == "enum":
                entity_kind = "enum"
            else:
                entity_kind = "struct"
            doc = parse_doxygen(doc_body)
            types.append({
                "name": tm.group("name"),
                "kind": entity_kind,
                "brief": doc["brief"],
                "description": doc["description"],
                "since": doc["since"],
                "deprecated": doc["deprecated"],
                "experimental": doc["experimental"],
                "notes": doc["notes"],
                "warnings": doc["warnings"],
                "see": doc["see"],
                "source": f"{source_rel}:{line_of(text, seg_start)}",
                "members": members,
                "nested": [],
            })
            continue

        hm = TYPEDEF_HANDLE_RE.match(code)
        if hm:
            doc = parse_doxygen(doc_body)
            types.append({
                "name": hm.group("name"),
                "kind": "handle",
                "brief": doc["brief"],
                "description": doc["description"],
                "since": doc["since"],
                "deprecated": doc["deprecated"],
                "experimental": doc["experimental"],
                "notes": doc["notes"],
                "warnings": doc["warnings"],
                "see": doc["see"],
                "source": f"{source_rel}:{line_of(text, seg_start)}",
                "members": [],
                "nested": [],
            })
            continue

        am = TYPEDEF_ALIAS_RE.match(code)
        if am and "(" not in code.split(";")[0]:
            doc = parse_doxygen(doc_body)
            types.append({
                "name": am.group("name"),
                "kind": "alias",
                "brief": doc["brief"],
                "description": doc["description"],
                "since": doc["since"],
                "deprecated": doc["deprecated"],
                "experimental": doc["experimental"],
                "notes": doc["notes"],
                "warnings": doc["warnings"],
                "see": doc["see"],
                "source": f"{source_rel}:{line_of(text, seg_start)}",
                "members": [],
                "nested": [],
                "underlying": normalize(am.group("type")),
            })

    entities = []
    for entity_name, fns in functions.items():
        entities.append({
            "name": entity_name,
            "kind": "functions",
            "brief": "",
            "description": [],
            "since": None,
            "deprecated": None,
            "experimental": any(f["experimental"] for f in fns),
            "notes": [],
            "warnings": [],
            "see": [],
            "source": source_rel,
            "members": fns,
            "nested": [],
        })
    entities.extend(types)
    return entities, version, source_rel


JS_MODIFIERS = r"(?:(?:public|static|override|abstract|async|readonly|declare)\s+)*"
JS_MEMBER_METHOD_RE = re.compile(rf"^  (?P<mods>{JS_MODIFIERS})(?P<accessor>get\s+|set\s+)?(?P<name>[\w$]+)\s*(?P<gen><[^>]*>)?\s*\(")
JS_MEMBER_FIELD_RE = re.compile(rf"^  (?P<mods>{JS_MODIFIERS})(?P<name>[\w$]+)\??\s*(?::\s*(?P<type>[^=;]+))?(?:=|;|$)")
JS_ENUM_MEMBER_RE = re.compile(r"^  (?P<name>[\w$]+)\s*(?:=\s*(?P<value>[^,]+))?,?\s*$")
JS_PUBLIC_EXPORT_RE = re.compile(r"export\s+(?:type\s+)?\{([^}]*)\}")
JS_EXPORT_RE = re.compile(r"^(?:export\s+)?(?:default\s+)?(?:async\s+)?(?:abstract\s+)?(class|interface|enum|type|function|const)\s+(\w+)")


def js_source_files(webcanvas_root):
    src = webcanvas_root / JS_SOURCE_DIR
    files = []
    for path in sorted(src.rglob("*.ts")):
        if path.name.endswith(".d.ts") or "/worker/" in path.as_posix():
            continue
        files.append(path)
    return files


def read_jsdoc_block(lines, end_index):
    """Return the raw body of the /** ... */ block that ends at lines[end_index], or None."""
    start = end_index
    while start >= 0 and not lines[start].strip().startswith("/**"):
        if lines[start].strip() and not lines[start].strip().startswith("*"):
            return None
        start -= 1
    if start < 0:
        return None
    body = "\n".join(lines[start:end_index + 1])
    inner = re.sub(r"^\s*/\*\*", "", body)
    inner = re.sub(r"\*/\s*$", "", inner)
    return inner


def collect_js(webcanvas_root):
    source_rel = (webcanvas_root / JS_SOURCE_DIR).relative_to(webcanvas_root).as_posix()
    entities = []
    version = "0.0.0"
    package_json = webcanvas_root / "package.json"
    if package_json.is_file():
        version = json.loads(package_json.read_text(encoding="utf-8")).get("version", version)

    for path in js_source_files(webcanvas_root):
        rel = path.relative_to(webcanvas_root).as_posix()
        lines = path.read_text(encoding="utf-8").split("\n")
        i = 0
        while i < len(lines):
            line = lines[i]
            em = JS_EXPORT_RE.match(line)
            if not em:
                i += 1
                continue
            kind, name = em.group(1), em.group(2)
            decl_start = i
            doc_body = read_jsdoc_block(lines, i - 1) if i > 0 and lines[i - 1].strip().endswith("*/") else None
            single_line = kind in ("type", "const") and not line.rstrip().endswith("{")
            while i < len(lines):
                if single_line and lines[i].rstrip().endswith(";"):
                    break
                if not single_line and i > decl_start and re.match(r"^}\s*;?\s*$", lines[i]):
                    break
                i += 1
            doc = parse_jsdoc(doc_body)
            entity = {
                "name": name,
                "kind": {"class": "class", "interface": "interface", "enum": "enum", "type": "type", "function": "function", "const": "const"}[kind],
                "brief": doc["brief"],
                "description": doc["description"],
                "since": doc["since"],
                "deprecated": doc["deprecated"],
                "experimental": doc["experimental"],
                "notes": doc["notes"],
                "warnings": doc["warnings"],
                "see": doc["see"],
                "examples": doc["examples"],
                "category": doc["category"],
                "signature": normalize(line.split("{")[0].rstrip()),
                "source": f"{rel}:{decl_start + 1}",
                "members": [],
                "nested": [],
            }
            if kind in ("class", "interface", "enum"):
                entity["members"] = js_members(lines, decl_start, i, kind)
            elif kind == "function":
                entity["members"] = [{
                    "name": name,
                    "kind": "function",
                    "signature": entity["signature"],
                    "brief": doc["brief"],
                    "description": doc["description"],
                    "params": doc["params"],
                    "returns": doc["returns"],
                    "examples": doc["examples"],
                    "notes": doc["notes"],
                    "warnings": doc["warnings"],
                    "see": doc["see"],
                    "since": doc["since"],
                    "deprecated": doc["deprecated"],
                    "experimental": doc["experimental"],
                    "line": decl_start + 1,
                }]
            entities.append(entity)
            i += 1
    public = public_js_names(webcanvas_root)
    entities = [e for e in entities if e["name"] in public or e["source"].split(":")[0].endswith("common/constants.ts")]
    return entities, version, source_rel


def js_members(lines, start, end, kind):
    members = []
    j = start + 1
    pending_doc = None
    while j < end:
        raw = lines[j]
        stripped = raw.strip()
        if raw.startswith("  /**") or raw.startswith("  /*"):
            k = j
            while k < end and "*/" not in lines[k]:
                k += 1
            block = "\n".join(lines[j:k + 1])
            pending_doc = re.sub(r"\*/\s*$", "", re.sub(r"^\s*/\*\*", "", block))
            j = k + 1
            continue
        if not raw.startswith("  ") or raw.startswith("   ") or not stripped or stripped.startswith("//"):
            j += 1
            continue
        if re.match(r"^  (private|protected)\b", raw) or re.match(r"^  #", raw) or stripped.startswith("["):
            pending_doc = None
            j += 1
            continue
        if kind == "enum":
            em = JS_ENUM_MEMBER_RE.match(raw)
            if em:
                doc = parse_jsdoc(pending_doc)
                members.append({
                    "name": em.group("name"), "kind": "enumerator", "value": normalize(em.group("value") or "") or None,
                    "brief": doc["brief"], "description": doc["description"], "since": doc["since"],
                    "experimental": doc["experimental"], "line": j + 1,
                })
            pending_doc = None
            j += 1
            continue

        mm = JS_MEMBER_METHOD_RE.match(raw)
        if mm:
            sig_lines = [raw]
            k = j
            while not re.search(r"[{;]\s*$", sig_lines[-1]) and k + 1 < end:
                k += 1
                sig_lines.append(lines[k])
            if sig_lines[-1].rstrip().endswith(";") and mm.group("name") == "constructor":
                pending_doc = None
                j = k + 1
                continue
            signature = normalize(" ".join(s.strip() for s in sig_lines))
            signature = re.sub(r"\s*\{\s*$", "", signature).rstrip(";").strip()
            signature = re.sub(r"^public\s+", "", signature)
            doc = parse_jsdoc(pending_doc)
            name = mm.group("name")
            members.append({
                "name": name,
                "kind": "constructor" if name == "constructor" else ("accessor" if mm.group("accessor") else "method"),
                "signature": signature,
                "static": "static" in mm.group("mods"),
                "brief": doc["brief"],
                "description": doc["description"],
                "params": doc["params"],
                "returns": doc["returns"],
                "examples": doc["examples"],
                "notes": doc["notes"],
                "warnings": doc["warnings"],
                "see": doc["see"],
                "since": doc["since"],
                "deprecated": doc["deprecated"],
                "experimental": doc["experimental"],
                "line": j + 1,
            })
            pending_doc = None
            j = k + 1
            continue

        fm = JS_MEMBER_FIELD_RE.match(raw)
        if fm and not raw.strip().endswith("{"):
            doc = parse_jsdoc(pending_doc)
            members.append({
                "name": fm.group("name"),
                "kind": "property",
                "type": normalize(fm.group("type") or "").rstrip(";"),
                "static": "static" in fm.group("mods"),
                "readonly": "readonly" in fm.group("mods"),
                "brief": doc["brief"] or "",
                "description": doc["description"],
                "since": doc["since"],
                "experimental": doc["experimental"],
                "line": j + 1,
            })
        pending_doc = None
        j += 1
    return members


def public_js_names(webcanvas_root):
    index_text = (webcanvas_root / JS_SOURCE_DIR / "index.ts").read_text(encoding="utf-8")
    names = set(re.findall(r"^export\s+(?:interface|type|function|const|class|enum)\s+(\w+)", index_text, re.M))
    namespace_object = re.search(r"const ThorVG = \{([^}]*)\}", index_text)
    if namespace_object:
        names.update(normalize(k) for k in namespace_object.group(1).split(",") if normalize(k))
    for block in JS_PUBLIC_EXPORT_RE.findall(index_text):
        for item in block.split(","):
            item = inline_markup(normalize(item))
            if not item:
                continue
            names.add(normalize(item.split(" as ")[-1]))
    return names


def group_entities(entities):
    buckets = {}
    for entity in entities:
        title = ENTITY_GROUP.get(entity["name"], TYPES_GROUP)
        buckets.setdefault(title, []).append(entity)
    for items in buckets.values():
        items.sort(key=lambda e: e["name"])
    return [(title, buckets[title]) for title in GROUP_ORDER + [TYPES_GROUP] if title in buckets]


def index_item(entity):
    return {
        "name": entity["name"],
        "kind": entity["kind"],
        "brief": entity.get("brief", ""),
        "experimental": entity.get("experimental", False),
        "file": f"{entity['name']}.json",
        "memberCount": len(entity.get("members", [])),
    }


def write_language(out_root, lang, entities, groups, version, source_rel):
    lang_dir = out_root / lang
    lang_dir.mkdir(parents=True, exist_ok=True)
    for stale in lang_dir.glob("*.json"):
        stale.unlink()
    for entity in entities:
        (lang_dir / f"{entity['name']}.json").write_text(
            json.dumps(entity, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
    index = {
        "language": lang,
        "version": version,
        "source": source_rel,
        "groups": [{"title": title, "items": [index_item(e) for e in items]} for title, items in groups],
    }
    (lang_dir / "index.json").write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    total = sum(len(e.get("members", [])) for e in entities)
    print(f"{lang}: {len(entities)} entities, {total} members -> {lang_dir}")


def main():
    cli = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    cli.add_argument("--thorvg", type=Path, default=DEFAULT_THORVG, help="ThorVG source root (C and C++ headers)")
    cli.add_argument("--webcanvas", type=Path, default=DEFAULT_WEBCANVAS, help="webcanvas package root (JS sources)")
    cli.add_argument("--out", type=Path, default=DEFAULT_OUT, help="output folder")
    cli.add_argument("--lang", choices=["cpp", "c", "js", "all"], default="all", help="which language to collect")
    args = cli.parse_args()

    if args.lang in ("cpp", "all"):
        entities, version, source_rel = collect_cpp(args.thorvg)
        write_language(args.out, "cpp", entities, group_entities(entities), version, source_rel)
    if args.lang in ("c", "all"):
        entities, version, source_rel = collect_c(args.thorvg)
        write_language(args.out, "c", entities, group_entities(entities), version, source_rel)
    if args.lang in ("js", "all"):
        entities, version, source_rel = collect_js(args.webcanvas)
        write_language(args.out, "js", entities, group_entities(entities), version, source_rel)


if __name__ == "__main__":
    main()
