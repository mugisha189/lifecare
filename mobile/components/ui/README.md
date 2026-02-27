# UI Components Library

A comprehensive set of reusable UI components for the LifeCare mobile app built
with React Native, NativeWind (TailwindCSS), and TypeScript.

## Components

### Input

A fully-featured input component with support for icons, labels, errors, and
various styles.

**Props:**

- `label`: Optional label text above the input
- `error`: Error message to display below the input
- `hint`: Hint text to display below the input
- `leftIcon`: Icon to display on the left side
- `rightIcon`: Icon to display on the right side
- `variant`: Style variant - `'outlined'`, `'filled'`, or `'underlined'`
  (default: `'outlined'`)
- `size`: Size of the input - `'sm'`, `'md'`, or `'lg'` (default: `'md'`)
- `showPasswordToggle`: Show password visibility toggle (default: `false`)
- `disabled`: Disable the input (default: `false`)

**Example:**

```tsx
<Input
  label="Email"
  placeholder="Enter your email"
  value={email}
  onChangeText={setEmail}
  leftIcon="mail-outline"
  variant="outlined"
  error={emailError}
/>

<Input
  label="Password"
  placeholder="Enter your password"
  value={password}
  onChangeText={setPassword}
  secureTextEntry
  showPasswordToggle
  leftIcon="lock-closed-outline"
/>
```

---

### Button

A versatile button component with multiple variants, sizes, loading states, and
icon support.

**Props:**

- `title`: Button text
- `variant`: Style variant - `'primary'`, `'secondary'`, `'outline'`, `'ghost'`,
  `'danger'`, or `'success'` (default: `'primary'`)
- `size`: Size of the button - `'sm'`, `'md'`, or `'lg'` (default: `'md'`)
- `loading`: Show loading indicator (default: `false`)
- `disabled`: Disable the button (default: `false`)
- `leftIcon`: Icon to display on the left side
- `rightIcon`: Icon to display on the right side
- `fullWidth`: Make button full width (default: `false`)

**Example:**

```tsx
<Button
  title="Login"
  variant="primary"
  size="lg"
  onPress={handleLogin}
  loading={isLoading}
  leftIcon="log-in-outline"
  fullWidth
/>

<Button
  title="Cancel"
  variant="outline"
  onPress={handleCancel}
/>
```

---

### Text

A typography component with predefined variants, weights, and colors.

**Props:**

- `variant`: Text style - `'h1'`, `'h2'`, `'h3'`, `'h4'`, `'body'`, `'caption'`,
  or `'label'` (default: `'body'`)
- `weight`: Font weight - `'regular'`, `'medium'`, `'semibold'`, or `'bold'`
  (default: `'regular'`)
- `color`: Text color - `'primary'`, `'secondary'`, `'muted'`, `'error'`,
  `'success'`, or `'warning'`
- `align`: Text alignment - `'left'`, `'center'`, or `'right'` (default:
  `'left'`)

**Example:**

```tsx
<Text variant="h1" weight="bold" color="primary">
  Welcome Back
</Text>

<Text variant="body" color="muted">
  Please enter your credentials to continue
</Text>
```

---

### Card

A container component with various styles and customization options.

**Props:**

- `variant`: Style variant - `'elevated'`, `'outlined'`, or `'filled'` (default:
  `'elevated'`)
- `padding`: Padding size - `'none'`, `'sm'`, `'md'`, or `'lg'` (default:
  `'md'`)
- `rounded`: Border radius - `'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, or
  `'full'` (default: `'xl'`)

**Example:**

```tsx
<Card variant="elevated" padding="md" rounded="xl">
  <Text variant="h3" weight="bold">
    Card Title
  </Text>
  <Text variant="body" color="muted">
    Card content goes here
  </Text>
</Card>
```

---

### Badge

A small label component for displaying status, counts, or categories.

**Props:**

- `label`: Badge text (required)
- `variant`: Style variant - `'primary'`, `'secondary'`, `'success'`,
  `'warning'`, `'danger'`, or `'info'` (default: `'primary'`)
- `size`: Size - `'sm'`, `'md'`, or `'lg'` (default: `'md'`)
- `icon`: Optional icon to display
- `rounded`: Use fully rounded style (default: `false`)

**Example:**

```tsx
<Badge label="New" variant="success" size="sm" icon="checkmark-circle" />
<Badge label="Pending" variant="warning" rounded />
```

---

### Avatar

A component for displaying user avatars with support for images, initials, or
icons.

**Props:**

- `source`: Image source (ImageSourcePropType)
- `uri`: Image URI string
- `name`: User name (will display initials)
- `size`: Size - `'sm'`, `'md'`, `'lg'`, or `'xl'` (default: `'md'`)
- `variant`: Shape - `'circle'`, `'rounded'`, or `'square'` (default:
  `'circle'`)
- `icon`: Icon to display if no image/name
- `backgroundColor`: Background color (default: `'#16A34A'`)
- `textColor`: Text color (default: `'#FFFFFF'`)

**Example:**

```tsx
<Avatar uri="https://example.com/avatar.jpg" size="lg" />
<Avatar name="John Doe" size="md" />
<Avatar icon="person-outline" size="sm" />
```

---

### Divider

A simple divider component for separating content.

**Props:**

- `orientation`: Direction - `'horizontal'` or `'vertical'` (default:
  `'horizontal'`)
- `thickness`: Line thickness - `'thin'`, `'medium'`, or `'thick'` (default:
  `'thin'`)
- `color`: Custom color (optional)

**Example:**

```tsx
<Divider orientation="horizontal" thickness="thin" />
<Divider orientation="vertical" thickness="medium" color="#E5E7EB" />
```

---

## Usage

Import components from the UI library:

```tsx
import {
  Input,
  Button,
  Text,
  Card,
  Badge,
  Avatar,
  Divider,
} from '@/components/ui';
```

Or import individual components:

```tsx
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
```

## Features

- **TypeScript Support**: Full type safety with TypeScript interfaces
- **Customizable**: Extensive props for customization
- **Consistent Design**: Uses NativeWind/TailwindCSS for consistent styling
- **Accessible**: Built with accessibility in mind
- **Reusable**: DRY principle - write once, use everywhere
- **Well Documented**: Comprehensive documentation and examples

## Styling

All components use NativeWind (TailwindCSS for React Native) for styling. You
can extend or override styles using the `className` prop available on all
components.

## Icons

Components use `@expo/vector-icons` (Ionicons) for icon support. You can find
all available icon names in the
[Ionicons documentation](https://ionic.io/ionicons).
