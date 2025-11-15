# Acrely Component Showcase

Quick reference guide with copy-paste examples for all @acrely/ui components.

---

## 🎨 Base Components

### Button
```tsx
import { Button } from "@acrely/ui";

// Primary action
<Button variant="primary">Save Changes</Button>

// Secondary
<Button variant="secondary">Cancel</Button>

// Outline
<Button variant="outline">Learn More</Button>

// Ghost (subtle)
<Button variant="ghost">Details</Button>

// Danger (destructive)
<Button variant="danger">Delete Account</Button>

// With sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// Loading state
<Button isLoading>Saving...</Button>

// Disabled
<Button disabled>Unavailable</Button>

// Full width
<Button className="w-full">Continue</Button>
```

### Input
```tsx
import { Input } from "@acrely/ui";

// Basic
<Input
  label="Email"
  type="email"
  placeholder="you@example.com"
  required
/>

// With error
<Input
  label="Password"
  type="password"
  error="Password must be at least 8 characters"
/>

// With helper text
<Input
  label="Username"
  helperText="This will be your public display name"
/>

// Disabled
<Input
  label="Account ID"
  value="ACR-12345"
  disabled
/>
```

### Select
```tsx
import { Select } from "@acrely/ui";

<Select
  label="Role"
  options={[
    { value: "admin", label: "Administrator" },
    { value: "manager", label: "Manager" },
    { value: "user", label: "User" }
  ]}
  placeholder="Select a role"
  required
/>

// With error
<Select
  label="Country"
  options={countries}
  error="Please select a country"
/>
```

### Textarea
```tsx
import { Textarea } from "@acrely/ui";

<Textarea
  label="Description"
  placeholder="Enter description..."
  rows={4}
  required
/>

// No resize
<Textarea
  label="Comments"
  resize="none"
  rows={3}
/>
```

### Checkbox
```tsx
import { Checkbox } from "@acrely/ui";

<Checkbox
  label="I agree to the terms and conditions"
  name="terms"
  required
/>

// With helper text
<Checkbox
  label="Subscribe to newsletter"
  helperText="You can unsubscribe at any time"
/>

// Small size
<Checkbox
  label="Remember me"
  size="sm"
/>
```

### RadioGroup
```tsx
import { RadioGroup } from "@acrely/ui";

// Vertical (default)
<RadioGroup
  label="Payment Method"
  name="payment"
  options={[
    { value: "card", label: "Credit Card" },
    { value: "bank", label: "Bank Transfer" },
    { value: "cash", label: "Cash" }
  ]}
  value={paymentMethod}
  onChange={(value) => setPaymentMethod(value)}
/>

// Horizontal
<RadioGroup
  label="Gender"
  name="gender"
  orientation="horizontal"
  options={[
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" }
  ]}
/>
```

---

## 📦 Layout Components

### Card
```tsx
import { Card, CardHeader, CardContent, CardFooter } from "@acrely/ui";

<Card>
  <CardHeader>
    <h3 className="text-lg font-semibold">Customer Details</h3>
    <p className="text-sm text-neutral-600">View and edit information</p>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      <Input label="Name" />
      <Input label="Email" type="email" />
    </div>
  </CardContent>
  <CardFooter className="flex justify-end gap-3">
    <Button variant="outline">Cancel</Button>
    <Button variant="primary">Save</Button>
  </CardFooter>
</Card>

// With hover effect
<Card hover>
  <CardContent>
    <p>Hover over me!</p>
  </CardContent>
</Card>
```

### Divider
```tsx
import { Divider } from "@acrely/ui";

// Horizontal (default)
<Divider />

// With label
<Divider label="OR" />
<Divider label="Continue with" labelPosition="left" />

// Vertical
<div className="flex items-center gap-4">
  <Button>Option 1</Button>
  <Divider orientation="vertical" className="h-8" />
  <Button>Option 2</Button>
</div>
```

---

## 💬 Feedback Components

### Alert
```tsx
import { Alert } from "@acrely/ui";

// Info
<Alert variant="info" title="Information">
  Your session will expire in 5 minutes.
</Alert>

// Success
<Alert variant="success" title="Success">
  Your changes have been saved successfully.
</Alert>

// Warning
<Alert variant="warning" title="Warning">
  This action cannot be undone.
</Alert>

// Error
<Alert variant="error" title="Error">
  Failed to save changes. Please try again.
</Alert>

// Closable
<Alert variant="info" closable onClose={() => console.log("Closed")}>
  You have 3 new notifications.
</Alert>
```

### Badge
```tsx
import { Badge } from "@acrely/ui";

// Status badges
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Overdue</Badge>
<Badge variant="info">Draft</Badge>

// With dot indicator
<Badge variant="success" dot>Online</Badge>

// Sizes
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>

// Outline
<Badge variant="outline">Outline</Badge>
```

### Spinner
```tsx
import { Spinner } from "@acrely/ui";

// Basic
<Spinner />

// With label
<Spinner label="Loading data..." />

// Sizes
<Spinner size="sm" />
<Spinner size="lg" />
<Spinner size="xl" />

// Variants
<Spinner variant="primary" />
<Spinner variant="white" /> {/* For dark backgrounds */}
```

### Skeleton
```tsx
import { Skeleton } from "@acrely/ui";

// Text loading
<Skeleton variant="text" lines={3} />

// Profile picture
<Skeleton variant="circular" width={40} height={40} />

// Image/card
<Skeleton variant="rectangular" height={200} />

// Custom width
<Skeleton width="75%" />
```

### Progress
```tsx
import { Progress } from "@acrely/ui";

// Basic
<Progress value={65} />

// With label
<Progress value={45} showLabel />

// Label positions
<Progress value={75} showLabel labelPosition="top" />
<Progress value={75} showLabel labelPosition="inside" size="lg" />

// Variants
<Progress value={50} variant="success" />
<Progress value={75} variant="warning" />
<Progress value={90} variant="error" />
```

---

## 📊 Data Display Components

### Table
```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@acrely/ui";

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Role</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {customers.map((customer) => (
      <TableRow key={customer.id}>
        <TableCell>{customer.name}</TableCell>
        <TableCell>{customer.email}</TableCell>
        <TableCell>{customer.role}</TableCell>
        <TableCell>
          <Badge variant={customer.status === 'active' ? 'success' : 'error'}>
            {customer.status}
          </Badge>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### EmptyState
```tsx
import { EmptyState } from "@acrely/ui";
import { Users, Inbox, FileText } from "lucide-react";

// With action
<EmptyState
  icon={<Users className="h-12 w-12" />}
  title="No customers yet"
  description="Get started by adding your first customer"
  action={<Button>Add Customer</Button>}
/>

// Simple
<EmptyState
  icon={<Inbox className="h-12 w-12" />}
  title="No messages"
  description="Your inbox is empty"
/>

// No search results
<EmptyState
  icon={<FileText className="h-12 w-12" />}
  title="No results found"
  description="Try adjusting your search or filter criteria"
/>
```

### Avatar
```tsx
import { Avatar } from "@acrely/ui";

// With image
<Avatar
  src="/profile.jpg"
  alt="John Doe"
  size="lg"
/>

// With initials (fallback)
<Avatar
  fallback="JD"
  alt="John Doe"
  size="md"
/>

// With status
<Avatar
  src="/profile.jpg"
  alt="Jane Smith"
  status="online"
/>

// Sizes
<Avatar fallback="S" size="sm" />
<Avatar fallback="M" size="md" />
<Avatar fallback="L" size="lg" />
<Avatar fallback="XL" size="xl" />

// Square shape
<Avatar
  src="/company.png"
  alt="Company"
  shape="square"
/>
```

---

## 🎯 Common Patterns

### Login Form
```tsx
import { Button, Input, Checkbox, Alert } from "@acrely/ui";

<form onSubmit={handleLogin} className="space-y-4">
  <Input
    label="Email"
    type="email"
    required
    disabled={loading}
  />
  <Input
    label="Password"
    type="password"
    required
    disabled={loading}
  />
  <Checkbox
    label="Remember me"
    name="remember"
  />
  {error && (
    <Alert variant="error">{error}</Alert>
  )}
  <Button type="submit" className="w-full" isLoading={loading}>
    Sign In
  </Button>
</form>
```

### Data Table with Loading
```tsx
import { Card, CardHeader, CardContent, Table, Skeleton, EmptyState } from "@acrely/ui";

<Card>
  <CardHeader>
    <h2 className="text-xl font-semibold">Customers</h2>
  </CardHeader>
  <CardContent>
    {loading ? (
      <Skeleton variant="rectangular" height={300} />
    ) : customers.length === 0 ? (
      <EmptyState
        title="No customers yet"
        action={<Button>Add Customer</Button>}
      />
    ) : (
      <Table>
        {/* Table content */}
      </Table>
    )}
  </CardContent>
</Card>
```

### Status Card
```tsx
import { Card, CardHeader, Badge, Avatar, Divider } from "@acrely/ui";

<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar src="/user.jpg" alt="John Doe" status="online" />
        <div>
          <h3 className="font-semibold">John Doe</h3>
          <p className="text-sm text-neutral-600">CEO</p>
        </div>
      </div>
      <Badge variant="success">Active</Badge>
    </div>
  </CardHeader>
  <Divider />
  <CardContent>
    <div className="space-y-2">
      <p className="text-sm">Email: john@example.com</p>
      <p className="text-sm">Phone: +234 XXX XXX XXXX</p>
    </div>
  </CardContent>
</Card>
```

### Progress Tracker
```tsx
import { Card, CardContent, Progress, Badge } from "@acrely/ui";

<Card>
  <CardContent>
    <div className="space-y-4">
      <div>
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Registration</span>
          <Badge variant="success">Complete</Badge>
        </div>
        <Progress value={100} variant="success" />
      </div>
      <div>
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Profile Setup</span>
          <Badge variant="warning">In Progress</Badge>
        </div>
        <Progress value={60} variant="warning" showLabel />
      </div>
    </div>
  </CardContent>
</Card>
```

---

## 🎨 Theming Examples

### Form with Consistent Spacing
```tsx
<form className="space-y-4 max-w-md">
  <Input label="Full Name" required />
  <Input label="Email" type="email" required />
  <Select
    label="Department"
    options={departments}
    required
  />
  <Textarea
    label="Bio"
    rows={4}
    helperText="Tell us about yourself"
  />
  <Divider />
  <div className="flex justify-end gap-3">
    <Button variant="outline">Cancel</Button>
    <Button variant="primary">Save</Button>
  </div>
</form>
```

### Alert Stack
```tsx
<div className="space-y-3 max-w-2xl">
  <Alert variant="info" closable>
    System maintenance scheduled for tonight at 10 PM.
  </Alert>
  <Alert variant="success" title="Payment Received">
    Your payment of ₦50,000 has been confirmed.
  </Alert>
  <Alert variant="warning" title="Action Required">
    Please verify your email address within 24 hours.
  </Alert>
</div>
```

---

## 💡 Tips & Tricks

### Custom Styling
All components accept `className` prop for customization:
```tsx
<Button className="bg-gradient-to-r from-purple-600 to-pink-600">
  Custom Gradient
</Button>

<Card className="border-2 border-primary-500">
  Custom Border
</Card>
```

### Composition
Combine components for complex UIs:
```tsx
<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Avatar fallback="JD" size="sm" />
        <span className="font-semibold">John Doe</span>
      </div>
      <Badge variant="success" dot>Online</Badge>
    </div>
  </CardHeader>
  <Divider />
  <CardContent>
    <Alert variant="info">
      You have 3 pending tasks
    </Alert>
  </CardContent>
</Card>
```

### Responsive Design
Use Tailwind breakpoints:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</div>
```

---

**For more details, see `DESIGN_SYSTEM_DOCUMENTATION.md`**
