# Generates src/content/diagrams/hub-architecture.svg (wide, traced from
# ../blogpost/ideal architecture.png at half scale) and hub-architecture.narrow.svg (the
# same boxes in two columns, for phones). Fills are classes styled by the blog's tokens,
# so both follow the theme. Run from the blog's root: python3 scripts/diagrams/hub-architecture.py
import math
from pathlib import Path

OUT = Path(__file__).resolve().parents[2] / 'src/content/diagrams'
LABEL = ('Architecture: location sources feed a readings table; a validation job turns readings '
         'into hub assessments, which are auto-updated, reviewed by people, or sent back for a '
         'new reading; a correction service writes the hubs table and a location history, which '
         'feed a dashboard and alerts.')
TEXT = {
    'staff': ('process', 'staff submissions', 'app, api, otp login'),
    'phone': ('process', 'phone heartbeat', 'hub phone gps'),
    'cell': ('process', 'cell-tower fixes', 'particle api'),
    'photos': ('process', 'photos', 'object storage'),
    'readings': ('store', 'location readings table', 'source, coordinates, accuracy, time, device, app version'),
    'rules': ('process', 'versioned rules', 'tested in CI'),
    'job': ('process', 'validation job', 'on new reading or schedule'),
    'assess': ('store', 'hub assessments', 'bucket, evidence, rules version'),
    'auto': ('process', 'auto-update', 'two signals agree'),
    'review': ('act', 'review page', 'confirm or drop a pin'),
    'request': ('act', 'request new reading', 'notify field staff'),
    'records': ('store', 'review records', 'pins kept separate'),
    'correct': ('process', 'correction service', 'compare-and-set, batch approval, undo'),
    'hubs': ('store', 'hubs table', 'live coordinates'),
    'history': ('store', 'location history', 'old, new, why, who'),
    'dash': ('process', 'dashboard and alerts', 'progress, confidence, failed job'),
}
LEGEND = (('store', 'stored in the database'), ('act', 'people act'), ('process', 'source or process'))
H = 59  # every box is this tall


def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;')


def svg(width, height, boxes, arrows, notes, legend):
    """boxes: name -> (x, y, w); notes: (x, y, text, anchor); legend: [(x, y)] per item."""
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" role="img" aria-label="{LABEL}">']
    for name, (x, y, w) in boxes.items():
        kind, title, sub = TEXT[name]
        cx = x + w / 2
        parts.append(f'<g class="{kind}"><rect x="{x}" y="{y}" width="{w}" height="{H}"/>'
                     f'<text x="{cx:g}" y="{y + 26}" class="t">{esc(title)}</text>'
                     f'<text x="{cx:g}" y="{y + 43}" class="s">{esc(sub)}</text></g>')
    for (x1, y1), (x2, y2) in arrows:
        a = math.atan2(y2 - y1, x2 - x1)
        p1 = (x2 - 6 * math.cos(a - 0.5), y2 - 6 * math.sin(a - 0.5))
        p2 = (x2 - 6 * math.cos(a + 0.5), y2 - 6 * math.sin(a + 0.5))
        parts.append(f'<path class="arrow" d="M{x1} {y1}L{x2:.1f} {y2:.1f}M{p1[0]:.1f} {p1[1]:.1f}'
                     f'L{x2:.1f} {y2:.1f}L{p2[0]:.1f} {p2[1]:.1f}"/>')
    for x, y, text, anchor in notes:
        style = '' if anchor == 'start' else f' style="text-anchor:{anchor}"'
        parts.append(f'<text x="{x}" y="{y}" class="note"{style}>{esc(text)}</text>')
    for (kind, label), (x, y) in zip(LEGEND, legend):
        parts.append(f'<g class="{kind}"><rect x="{x}" y="{y}" width="18" height="18"/></g>'
                     f'<text x="{x + 28}" y="{y + 14}" class="legend">{label}</text>')
    parts.append('</svg>')
    return '\n'.join(parts) + '\n'


def wide():
    boxes = {
        'staff': (41, 36, 164), 'phone': (230, 36, 164), 'cell': (419, 36, 164), 'photos': (608, 36, 164),
        'readings': (41, 120, 731),
        'rules': (41, 204, 164), 'job': (230, 204, 353),
        'assess': (308, 288, 220),
        'auto': (147, 372, 164), 'review': (336, 372, 164), 'request': (526, 372, 164),
        'records': (336, 457, 164),
        'correct': (230, 542, 377),
        'hubs': (230, 627, 164), 'history': (443, 627, 164),
        'dash': (230, 712, 377),
    }
    arrows = [
        ((123, 95), (123, 120)), ((312, 95), (312, 120)), ((501, 95), (501, 120)), ((690, 95), (690, 120)),
        ((205, 233), (230, 233)),
        ((418, 263), (418, 288)),
        ((400, 347), (229, 372)), ((418, 347), (418, 372)), ((468, 347), (608, 372)),
        ((418, 431), (418, 457)),
        ((240, 431), (310, 542)), ((418, 516), (418, 542)),
        ((312, 601), (312, 627)), ((525, 601), (525, 627)),
        ((312, 686), (312, 712)), ((525, 686), (525, 712)),
    ]
    notes = [(594, 238, '*re-checks on new data', 'start'), (608, 449, 'new submission feeds readings', 'start')]
    legend, x = [], 41
    for _, label in LEGEND:
        legend.append((x, 830))
        x += 28 + len(label) * 7.6 + 36
    return svg(820, 900, boxes, arrows, notes, legend)


def narrow():
    # Two columns of 162 with a 12 gap, full-width boxes across both; rows 84 apart.
    L, R, FULL, MID = 12, 186, 336, 180
    boxes = {
        'staff': (L, 20, 162), 'phone': (R, 20, 162),
        'cell': (L, 89, 162), 'photos': (R, 89, 162),
        'readings': (L, 173, FULL),
        'rules': (L, 282, 140), 'job': (176, 282, 172),
        'assess': (70, 366, 220),
        'auto': (L, 450, 162), 'request': (R, 450, 162),
        'review': (99, 548, 162),
        'records': (99, 632, 162),
        'correct': (L, 716, FULL),
        'hubs': (L, 800, 162), 'history': (R, 800, 162),
        'dash': (L, 884, FULL),
    }
    arrows = [
        ((MID, 148), (MID, 173)),        # the four sources, as one group
        ((152, 311), (176, 311)),        # rules into the job
        ((262, 341), (262, 366)),
        ((140, 425), (93, 450)), ((220, 425), (267, 450)), ((MID, 425), (MID, 548)),
        ((MID, 607), (MID, 632)),
        ((40, 509), (40, 716)), ((MID, 691), (MID, 716)),
        ((93, 775), (93, 800)), ((267, 775), (267, 800)),
        ((93, 859), (93, 884)), ((267, 859), (267, 884)),
    ]
    notes = [
        (348, 274, '*re-checks on new data', 'end'),
        # Two lines, so it stays clear of the arrow down to the review page.
        (348, 524, 'new submission', 'end'), (348, 538, 'feeds readings', 'end'),
    ]
    legend = [(L, 969), (L, 995), (L, 1021)]
    return svg(360, 1054, boxes, arrows, notes, legend)


(OUT / 'hub-architecture.svg').write_text(wide())
(OUT / 'hub-architecture.narrow.svg').write_text(narrow())
print('wrote', OUT / 'hub-architecture.svg', 'and .narrow.svg')
