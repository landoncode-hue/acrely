# Acrely Design System Documentation

**Version:** 2.0.0  
**Last Updated:** November 14, 2025  
**Design Philosophy:** Modern SaaS • Accessible • Scalable

---

## Table of Contents
1. [Overview](#overview)
2. [Design Tokens](#design-tokens)
3. [Component Library](#component-library)
4. [Usage Guidelines](#usage-guidelines)
5. [Accessibility](#accessibility)
6. [Best Practices](#best-practices)

---

## Overview

The Acrely Design System is a comprehensive collection of reusable components, design tokens, and guidelines for building consistent, accessible user interfaces across the Acrely platform.

### Key Principles
- **Consistency**: Same components, same experience
- **Accessibility**: WCAG 2.1 AA compliant
- **Performance**: Optimized bundle sizes
- **Developer Experience**: Simple, predictable APIs

---

## Design Tokens

### Color Palette

#### Brand Colors
```javascript
Primary (Acrely Orange-Red):
  50:  #fef2ee
  100: #fde5dc
  500: #D54A1D ← Primary
  900: #2b0f06

Accent (Peach):
  50:  #fff5ed
  100: #ffebdb
  500: #FF9B45 ← Accent
  900: #331f0e
```

#### Semantic Colors
```javascript
Success (Green):
  500: #22c55e
  Use for: Confirmations, success states

Warning (Amber):
  500: #f59e0b
  Use for: Warnings, pending states

Error (Red):
  500: #ef4444
  Use for: Errors, destructive actions

Info (Blue):
  500: #3b82f6
  Use for: Information, neutral actions
```

#### Neutral (Slate)
```javascript
Neutral:
  50:  #f8fafc ← Backgrounds
  100: #f1f5f9 ← Subtle backgrounds
  200: #e2e8f0 ← Borders
  300: #cbd5e1 ← Disabled states
  500: #64748b ← Secondary text
  700: #334155 ← Primary text
  900: #0f172a ← Headings
```

### Typography

#### Font Families
- **Sans-serif (Primary)**: Inter
- **Monospace (Code)**: JetBrains Mono

#### Font Sizes
| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| xs | 0.75rem | 1rem | Tiny labels, badges |
| sm | 0.875rem | 1.25rem | Small text, captions |
| base | 1rem | 1.5rem | Body text |
| lg | 1.125rem | 1.75rem | Large body text |
| xl | 1.25rem | 1.75rem | Small headings |
| 2xl | 1.5rem | 2rem | Section headings |
| 3xl | 1.875rem | 2.25rem | Page headings |
| 4xl | 2.25rem | 2.5rem | Hero text |

#### Font Weights
- Light: 300
- Normal: 400
- Medium: 500 ← Body emphasis
- Semibold: 600 ← Headings
- Bold: 700 ← Strong emphasis
- Extrabold: 800 ← Hero text

### Spacing Scale
```javascript
0.5  → 0.125rem (2px)
1    → 0.25rem  (4px)
2    → 0.5rem   (8px)
4    → 1rem     (16px)  ← Base unit
6    → 1.5rem   (24px)
8    → 2rem     (32px)
12   → 3rem     (48px)
16   → 4rem     (64px)
24   → 6rem     (96px)
```

**Usage:**
- Padding: Use 4, 6, 8 for components
- Margins: Use 2, 4, 6, 8 for spacing between elements
- Gaps: Use 2, 4, 6 for flex/grid gaps

### Border Radius
```javascript
sm   → 0.125rem (2px)  - Subtle rounding
DEFAULT → 0.25rem (4px) - Standard inputs
md   → 0.375rem (6px)
lg   → 0.5rem   (8px)  - Cards, buttons
xl   → 0.75rem  (12px)
2xl  → 1rem     (16px) - Icons, avatars
full → 9999px          - Pills, badges
```

### Shadows
```javascript
sm  → Subtle lift (tables, inputs)
DEFAULT → Standard elevation (cards)
md  → Medium lift (modals)
lg  → High elevation (dropdowns)
xl  → Maximum elevation (dialogs)
2xl → Dramatic shadow (overlays)
```

### Animations

#### Duration
- Fast: 150ms - Micro-interactions
- Normal: 200ms - Standard transitions
- Slow: 300ms - Page transitions

#### Easing
- ease-in: Accelerating
- ease-out: Decelerating (preferred)
- ease-in-out: Smooth start and end

---

## Component Library

### Base Components

#### Button
**Variants:** primary, secondary, outline, ghost, danger  
**Sizes:** sm, md, lg  
**Props:** `variant`, `size`, `isLoading`, `disabled`, `children`

```tsx
import { Button } from "@acrely/ui";

// Primary action
<Button variant="primary" size="lg">
  Save Changes
</Button>

// Secondary action
<Button variant="outline">
  Cancel
</Button>

// Loading state
<Button variant="primary" isLoading>
  Saving...
</Button>
```

**When to use:**
- Primary: Main call-to-action (1 per screen)
- Secondary: Alternative actions
- Outline: Tertiary actions
- Ghost: Subtle actions, icon buttons
- Danger: Destructive actions (delete, remove)

---

#### Input
**Props:** `label`, `error`, `helperText`, `required`, `disabled`, `placeholder`

```tsx
import { Input } from "@acrely/ui";

<Input
  label="Email Address"
  type="email"
  placeholder="you@example.com"
  required
  error="Invalid email format"
  helperText="We'll never share your email"
/>
```

**Validation states:**
- Default: Neutral border
- Focus: Primary ring
- Error: Red border + error message
- Disabled: Gray background

---

#### Select
**Props:** `label`, `options`, `placeholder`, `error`, `helperText`, `required`

```tsx
import { Select } from "@acrely/ui";

<Select
  label="Role"
  options={[
    { value: "admin", label: "Administrator" },
    { value: "user", label: "User" }
  ]}
  placeholder="Select a role"
  required
/>
```

---

### Layout Components

#### Card
**Subcomponents:** CardHeader, CardContent, CardFooter  
**Props:** `hover` (boolean)

```tsx
import { Card, CardHeader, CardContent, CardFooter } from "@acrely/ui";

<Card hover>
  <CardHeader>
    <h3>Customer Details</h3>
  </CardHeader>
  <CardContent>
    <p>Content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Save</Button>
  </CardFooter>
</Card>
```

**When to use:**
- Group related content
- Create visual hierarchy
- Separate sections on a page

---

### Feedback Components

#### Alert
**Variants:** info, success, warning, error  
**Props:** `variant`, `title`, `closable`, `onClose`

```tsx
import { Alert } from "@acrely/ui";

<Alert variant="success" title="Success" closable>
  Your changes have been saved successfully.
</Alert>
```

**Usage guidelines:**
- Info: Neutral information
- Success: Confirmations, completions
- Warning: Cautionary messages
- Error: Error messages, failed actions

---

#### Badge
**Variants:** default, primary, success, warning, error, info, outline  
**Sizes:** sm, md, lg  
**Props:** `variant`, `size`, `dot`, `icon`

```tsx
import { Badge } from "@acrely/ui";

<Badge variant="success" dot>Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Overdue</Badge>
```

**Common use cases:**
- Status indicators
- Category labels
- Notification counts
- Feature flags

---

#### Spinner
**Variants:** primary, white, neutral  
**Sizes:** sm, md, lg, xl  
**Props:** `size`, `variant`, `label`

```tsx
import { Spinner } from "@acrely/ui";

<Spinner size="lg" label="Loading data..." />
```

---

#### Skeleton
**Variants:** text, circular, rectangular  
**Props:** `variant`, `width`, `height`, `lines`

```tsx
import { Skeleton } from "@acrely/ui";

// Text loading
<Skeleton variant="text" lines={3} />

// Profile picture loading
<Skeleton variant="circular" width={40} height={40} />

// Card loading
<Skeleton variant="rectangular" height={200} />
```

**When to use:**
- Initial page load
- Data fetching
- Lazy-loaded content
- Better UX than spinners for content

---

#### Progress
**Variants:** primary, success, warning, error  
**Sizes:** sm, md, lg  
**Props:** `value`, `max`, `showLabel`, `labelPosition`

```tsx
import { Progress } from "@acrely/ui";

<Progress value={65} max={100} showLabel />
```

---

### Data Display Components

#### Table
**Subcomponents:** TableHeader, TableBody, TableRow, TableHead, TableCell

```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@acrely/ui";

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>john@example.com</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

#### EmptyState
**Props:** `icon`, `title`, `description`, `action`

```tsx
import { EmptyState } from "@acrely/ui";
import { Inbox } from "lucide-react";

<EmptyState
  icon={<Inbox className="h-12 w-12" />}
  title="No customers yet"
  description="Get started by adding your first customer"
  action={<Button>Add Customer</Button>}
/>
```

**When to use:**
- Empty lists/tables
- No search results
- Deleted all items
- New user onboarding

---

#### Avatar
**Sizes:** sm, md, lg, xl  
**Shapes:** circle, square  
**Props:** `src`, `alt`, `fallback`, `status`

```tsx
import { Avatar } from "@acrely/ui";

<Avatar
  src="/profile.jpg"
  alt="John Doe"
  size="lg"
  status="online"
/>

// With fallback initials
<Avatar
  fallback="JD"
  size="md"
/>
```

---

### Form Components

#### Checkbox
**Props:** `label`, `helperText`, `error`, `checked`, `onChange`

```tsx
import { Checkbox } from "@acrely/ui";

<Checkbox
  label="I agree to the terms and conditions"
  checked={agreed}
  onChange={(e) => setAgreed(e.target.checked)}
/>
```

---

#### RadioGroup
**Props:** `label`, `options`, `name`, `value`, `onChange`, `orientation`

```tsx
import { RadioGroup } from "@acrely/ui";

<RadioGroup
  label="Payment Method"
  name="payment"
  options={[
    { value: "card", label: "Credit Card" },
    { value: "cash", label: "Cash" }
  ]}
  value={paymentMethod}
  onChange={(value) => setPaymentMethod(value)}
/>
```

---

## Usage Guidelines

### Component Composition
```tsx
// ✅ Good: Compose Card subcomponents
<Card>
  <CardHeader>
    <h3>Title</h3>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// ❌ Bad: Custom div structure
<div className="card">
  <div className="card-header">Title</div>
</div>
```

### Color Usage
```tsx
// ✅ Good: Use semantic colors
<Alert variant="error">Error message</Alert>
<Badge variant="success">Active</Badge>

// ❌ Bad: Direct color classes
<div className="bg-red-500">Error</div>
```

### Spacing
```tsx
// ✅ Good: Use spacing scale
<div className="space-y-4">
  <Card />
  <Card />
</div>

// ❌ Bad: Arbitrary values
<div className="space-y-[17px]">
```

---

## Accessibility

### Keyboard Navigation
All interactive components support:
- **Tab**: Navigate through elements
- **Enter/Space**: Activate buttons, checkboxes
- **Escape**: Close modals, dropdowns
- **Arrow keys**: Navigate lists, radio groups

### ARIA Attributes
Components include appropriate ARIA labels:
```tsx
<Button aria-label="Close dialog">×</Button>
<Alert role="alert">Error message</Alert>
<Progress role="progressbar" aria-valuenow={50} />
```

### Focus Indicators
All focusable elements have visible focus rings:
```css
focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
```

### Screen Readers
- Semantic HTML (`<button>`, `<label>`, etc.)
- Alt text for images
- ARIA labels for icon buttons
- Status announcements for dynamic content

---

## Best Practices

### Component Selection
1. **Use design system components first**
2. **Compose existing components** before creating new ones
3. **Extend with className prop** for custom styles
4. **Create new components** only when necessary

### Performance
- Lazy load components when possible
- Use Skeleton for loading states
- Avoid deep nesting
- Minimize re-renders with React.memo

### Consistency
- Use design tokens (colors, spacing, typography)
- Follow naming conventions
- Maintain component hierarchy
- Document custom implementations

### Maintainability
- Keep components small and focused
- Use TypeScript for type safety
- Write tests for critical components
- Document non-obvious behavior

---

## Quick Reference

### Common Patterns

#### Form Layout
```tsx
<form className="space-y-4">
  <Input label="Name" required />
  <Input label="Email" type="email" required />
  <Select label="Role" options={roles} required />
  <Button type="submit" className="w-full">
    Submit
  </Button>
</form>
```

#### Data Table
```tsx
<Card>
  <CardHeader>
    <h2>Customers</h2>
  </CardHeader>
  <CardContent>
    <Table>
      {/* Table content */}
    </Table>
  </CardContent>
</Card>
```

#### Loading State
```tsx
{loading ? (
  <Skeleton variant="rectangular" height={200} />
) : (
  <Card>{/* Content */}</Card>
)}
```

#### Empty State
```tsx
{customers.length === 0 ? (
  <EmptyState
    icon={<Users />}
    title="No customers yet"
    action={<Button>Add Customer</Button>}
  />
) : (
  <Table>{/* Customers */}</Table>
)}
```

---

## Resources

- **Tailwind CSS**: https://tailwindcss.com/docs
- **Lucide Icons**: https://lucide.dev
- **WCAG Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **React Patterns**: https://reactpatterns.com

---

**Need help?** Contact the design system team or refer to component JSDoc in the codebase.

**Built with ❤️ by Landon Digital • Acrely v2.0**
