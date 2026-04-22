# AfriFutures UI Design System

## Overview

This document defines the visual language and component standards for AfriFutures, ensuring consistency across all user types and dashboards.

---

## Design Tokens

### Colors

```css
/* Primary - Trust & Growth (Emerald) */
--primary: #10B981;        /* Emerald 500 */
--primary-dark: #059669;   /* Emerald 600 */
--primary-light: #34D399;  /* Emerald 400 */

/* Secondary - Africa (Amber) */
--secondary: #F59E0B;      /* Amber 500 */
--secondary-dark: #D97706; /* Amber 600 */

/* Backgrounds */
--background: #FFFFFF;
--background-secondary: #F9FAFB;
--card: #FFFFFF;
--card-hover: #F3F4F6;

/* Borders */
--border: #E5E7EB;
--border-light: #F3F4F6;

/* Text */
--text-primary: #111827;
--text-secondary: #6B7280;
--text-muted: #9CA3AF;

/* Status */
--success: #10B981;
--warning: #F59E0B;
--error: #EF4444;
--info: #3B82F6;

/* Dark Mode */
--dark-bg: #111827;
--dark-card: #1F2937;
--dark-border: #374151;
```

### Typography

| Element | Font | Weight | Size |
|---------|------|--------|------|
| H1 | Inter | 700 | 2.25rem / 36px |
| H2 | Inter | 600 | 1.875rem / 30px |
| H3 | Inter | 600 | 1.5rem / 24px |
| Body | Inter | 400 | 1rem / 16px |
| Small | Inter | 400 | 0.875rem / 14px |
| Caption | Inter | 400 | 0.75rem / 12px |
| Mono | JetBrains Mono | 400 | 0.875rem / 14px |

### Spacing

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps, inline spacing |
| sm | 8px | Component internal padding |
| md | 16px | Card padding, section gaps |
| lg | 24px | Page section margins |
| xl | 32px | Major section separators |
| 2xl | 48px | Page header spacing |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| sm | 6px | Buttons, inputs |
| md | 8px | Cards |
| lg | 12px | Modals, large cards |
| xl | 16px | Featured cards |

---

## Component Standards

### Buttons

**Primary Button**
```tsx
<Button className="bg-primary hover:bg-primary-dark text-white">
  Action
</Button>
```

**Secondary Button**
```tsx
<Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
  Action
</Button>
```

**Ghost Button**
```tsx
<Button variant="ghost" className="text-gray-600 hover:bg-gray-100">
  Action
</Button>
```

### Cards

**Standard Card**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
</Card>
```

**Card with Action**
```tsx
<Card>
  <CardHeader>
    <div>
      <CardTitle>Title</CardTitle>
      <CardDescription>Description</CardDescription>
    </div>
    <CardAction>
      <Button size="sm">Action</Button>
    </CardAction>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
</Card>
```

### Badges

| Variant | Usage |
|---------|-------|
| default | Neutral status |
| success | Active, Verified |
| warning | Pending, Attention |
| error | Failed, Rejected |
| outline | Secondary info |

### Stats Cards

**Standard Stats Grid**
```tsx
<StatsGrid columns={4}>
  <StatCard
    title="Active Users"
    value="1,234"
    icon={Users}
    color="emerald"
  />
  <StatCard
    title="Volume"
    value="$50K"
    icon={DollarSign}
    color="cyan"
    trend={{ value: 12.5, isPositive: true }}
  />
</StatsGrid>
```

---

## Dashboard Layouts

### Header (All Dashboards)

Every dashboard MUST include `AppHeader`:
```tsx
<div className="min-h-screen bg-gray-50">
  <AppHeader />
  <main className="container mx-auto px-4 py-8">
    {/* Content */}
  </main>
</div>
```

### Page Header

```tsx
<div className="mb-8">
  <h1 className="text-3xl font-bold mb-2">Dashboard Title</h1>
  <p className="text-gray-600">Subtitle describing the page</p>
</div>
```

### Stats Section

Always use 4-column grid on desktop:
```tsx
<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
  {/* 4 StatCards */}
</div>
```

### Tabs

Use tabs for related content sections:
```tsx
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content</TabsContent>
  <TabsContent value="tab2">Content</TabsContent>
</Tabs>
```

---

## Color by User Type

### Farmer Dashboard
- Primary accent: Emerald
- Secondary: Amber
- Trust indicator: Green badges

### Cooperative Dashboard
- Primary accent: Purple
- Secondary: Emerald
- Verification badges: Blue

### Trader Dashboard
- Primary accent: Cyan
- Secondary: Emerald
- Charts: Multiple colors

### Agent Dashboard
- Primary accent: Emerald/Cyan gradient
- Dark mode available
- Technical appearance

---

## Accessibility

- All interactive elements must have focus states
- Use semantic HTML (nav, main, section, article)
- Color contrast ratio: 4.5:1 minimum
- Screen reader labels for icon-only buttons
- Keyboard navigation for all features

---

## Responsive Breakpoints

| Breakpoint | Width | Columns |
|------------|-------|---------|
| Mobile | < 640px | 1 |
| Tablet | 640px - 768px | 1-2 |
| Desktop | 768px - 1024px | 2-4 |
| Wide | > 1024px | 4 |

---

## File Structure

```
components/
├── ui/
│   ├── button.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   ├── stat-card.tsx      # NEW: Standard stats component
│   ├── tabs.tsx
│   └── ...
├── dashboard/
│   ├── farmer-dashboard.tsx
│   ├── coop-dashboard.tsx
│   ├── trader-dashboard.tsx
│   └── agent-dashboard.tsx
└── shared/
    ├── page-header.tsx
    ├── stats-grid.tsx
    └── ...
```

---

## Migration Guide

### Old Pattern (A2A Marketplace)
```tsx
// ❌ Don't use this style
<div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
```

### New Pattern (Consistent)
```tsx
// ✅ Use this pattern
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
</Card>
```

### Updating Existing Components

1. Replace custom styled divs with `<Card>` components
2. Use `<StatCard>` for all stats displays
3. Include `<AppHeader>` in all pages
4. Use consistent color tokens from design system
