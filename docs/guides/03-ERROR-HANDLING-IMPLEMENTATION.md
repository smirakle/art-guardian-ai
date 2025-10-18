# Error Handling Implementation Guide

## Overview
Transform the application's error handling from basic console logging to production-grade user-friendly error management.

**Current State**: ✅ ErrorBoundary wrapper added, standardized error handler created
**Target State**: All async operations use proper error handling with user feedback

---

## Architecture

### Error Handling Layers

```
┌─────────────────────────────────────┐
│   1. Component Error Boundaries     │ ← Catches React errors
├─────────────────────────────────────┤
│   2. Async Operation Wrappers       │ ← Handles promise rejections
├─────────────────────────────────────┤
│   3. API Call Interceptors          │ ← Handles network errors
├─────────────────────────────────────┤
│   4. User Feedback (Toasts)         │ ← Shows user-friendly messages
└─────────────────────────────────────┘
```

---

## Phase 1: Standardize Error Messages (DONE ✅)

Already implemented in `src/lib/errorHandler.ts`:
- `getErrorMessage()` - Extract user-friendly messages
- `handleError()` - Log and display errors
- `handleAsyncOperation()` - Wrapper for async functions

---

## Phase 2: Update All Async Operations

### Pattern to Follow

```typescript
// ❌ BEFORE (inconsistent error handling)
const handleSubmit = async () => {
  try {
    const { data, error } = await supabase.from('table').insert(values);
    if (error) {
      console.error(error);
      toast({ title: "Error", description: "Something went wrong" });
    }
  } catch (err) {
    console.error(err);
  }
};

// ✅ AFTER (standardized)
import { handleAsyncOperation } from '@/lib/errorHandler';

const handleSubmit = async () => {
  const { data, error } = await handleAsyncOperation(
    async () => {
      const result = await supabase.from('table').insert(values);
      if (result.error) throw result.error;
      return result.data;
    },
    {
      action: 'save item',
      successMessage: 'Item saved successfully!',
      showSuccessToast: true
    }
  );
  
  if (!error) {
    // Handle success
  }
};
```

### Files to Update

#### High Priority (User-Facing Forms)

1. **Authentication** (`src/pages/Auth.tsx`)
```typescript
// Update signIn function
const signIn = async () => {
  setLoading(true);
  const { error } = await handleAsyncOperation(
    async () => {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
    },
    {
      action: 'sign in',
      showSuccessToast: false // Don't show toast, just redirect
    }
  );
  
  setLoading(false);
  if (!error) {
    navigate('/dashboard');
  }
};

// Update signUp function similarly
const signUp = async () => {
  setLoading(true);
  const { error } = await handleAsyncOperation(
    async () => {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username: username,
          },
        },
      });
      if (signUpError) throw signUpError;
    },
    {
      action: 'create account',
      successMessage: 'Account created! Please check your email to verify.',
      showSuccessToast: true
    }
  );
  
  setLoading(false);
};
```

2. **Bug Report** (`src/components/BugReportButton.tsx`)
```typescript
const handleSubmit = async () => {
  if (!subject || !description) {
    toast({
      title: "Validation Error",
      description: "Please fill in both subject and description.",
      variant: "destructive",
    });
    return;
  }

  setLoading(true);
  
  const { error } = await handleAsyncOperation(
    async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error: submitError } = await supabase.functions.invoke('send-bug-report', {
        body: {
          subject,
          description,
          stepsToReproduce,
          userEmail: user?.email || 'Anonymous',
          userName: user?.user_metadata?.full_name || 'Anonymous User',
        }
      });
      
      if (submitError) throw submitError;
    },
    {
      action: 'submit bug report',
      successMessage: 'Bug report submitted successfully! We\'ll review it shortly.',
      showSuccessToast: true
    }
  );
  
  setLoading(false);
  
  if (!error) {
    setOpen(false);
    setSubject('');
    setDescription('');
    setStepsToReproduce('');
  }
};
```

3. **File Upload** (`src/pages/Upload.tsx`)
```typescript
const handleUpload = async () => {
  if (!selectedFile) {
    toast({
      title: "No File Selected",
      description: "Please select a file to upload.",
      variant: "destructive",
    });
    return;
  }

  setIsUploading(true);
  
  const { data, error } = await handleAsyncOperation(
    async () => {
      // Upload file to storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `artwork/${auth.uid()}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('artwork-files')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Create artwork record
      const { data: artwork, error: insertError } = await supabase
        .from('artwork')
        .insert({
          title: artworkTitle,
          description: artworkDescription,
          category: selectedCategory,
          file_paths: [filePath],
          user_id: auth.uid(),
          status: 'processing'
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return artwork;
    },
    {
      action: 'upload artwork',
      successMessage: 'Artwork uploaded successfully!',
      showSuccessToast: true
    }
  );
  
  setIsUploading(false);
  
  if (!error && data) {
    navigate(`/dashboard?artwork=${data.id}`);
  }
};
```

4. **Subscription Management** (`src/pages/Checkout.tsx`)
```typescript
const handleUpgrade = async (planId: string) => {
  setIsProcessing(true);
  
  const { data, error } = await handleAsyncOperation(
    async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please sign in to upgrade');

      const { data: session, error: sessionError } = await supabase.functions.invoke(
        'create-checkout-session',
        {
          body: {
            planId,
            billingCycle: selectedBillingCycle,
            email: user.email,
            promoCode: promoCode || undefined
          }
        }
      );

      if (sessionError) throw sessionError;
      if (!session?.url) throw new Error('Failed to create checkout session');

      // Redirect to Stripe
      window.location.href = session.url;
    },
    {
      action: 'start checkout',
      showSuccessToast: false // Redirect happens instead
    }
  );
  
  if (error) {
    setIsProcessing(false);
  }
};
```

---

## Phase 3: Add Loading States

### Pattern for Loading States

```typescript
// ❌ BEFORE (no loading state)
const saveData = async () => {
  await supabase.from('table').insert(data);
};

// ✅ AFTER (with loading state)
const [isSaving, setIsSaving] = useState(false);

const saveData = async () => {
  setIsSaving(true);
  const { error } = await handleAsyncOperation(
    async () => {
      const { error } = await supabase.from('table').insert(data);
      if (error) throw error;
    },
    { action: 'save data', successMessage: 'Data saved!' }
  );
  setIsSaving(false);
};

// In render:
<Button onClick={saveData} disabled={isSaving}>
  {isSaving ? (
    <>
      <LoadingSpinner size="sm" className="mr-2" />
      Saving...
    </>
  ) : (
    'Save'
  )}
</Button>
```

### Components Needing Loading States

1. **Authentication Forms**
   - Login button
   - Sign up button
   - Password reset button

2. **File Upload**
   - Upload button
   - Show upload progress

3. **Data Fetching**
   - Dashboard loading
   - Artwork gallery loading
   - Settings loading

4. **Forms**
   - Profile update
   - Settings save
   - Bug report submit

---

## Phase 4: Implement Skeleton Loaders

### When to Use Skeletons vs Spinners

**Use Skeleton Loaders** for:
- Initial page load
- Data tables
- Card grids
- List views

**Use Spinners** for:
- Button actions
- Small inline operations
- Refreshing data

### Example: Dashboard Skeleton

```typescript
// src/components/DashboardSkeleton.tsx
import { Skeleton } from '@/components/ui/skeleton';

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 border rounded-lg">
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
      
      <div>
        <Skeleton className="h-6 w-1/4 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border rounded-lg overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <div className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Usage in Dashboard
const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [artwork, setArtwork] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    const { data, error } = await handleAsyncOperation(
      async () => {
        const { data, error } = await supabase
          .from('artwork')
          .select('*')
          .eq('user_id', auth.uid());
        if (error) throw error;
        return data;
      },
      { action: 'load dashboard' }
    );
    if (!error) setArtwork(data);
    setIsLoading(false);
  };

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div>
      {/* Actual dashboard content */}
    </div>
  );
};
```

---

## Phase 5: Error Recovery Actions

### Retry Logic

```typescript
// src/lib/retryHandler.ts
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    delayMs?: number;
    backoff?: boolean;
  } = {}
): Promise<T> {
  const { maxRetries = 3, delayMs = 1000, backoff = true } = options;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      const delay = backoff ? delayMs * Math.pow(2, attempt - 1) : delayMs;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('Max retries exceeded');
}

// Usage
const loadCriticalData = async () => {
  const { data, error } = await handleAsyncOperation(
    async () => {
      return await withRetry(
        async () => {
          const { data, error } = await supabase
            .from('critical_table')
            .select('*');
          if (error) throw error;
          return data;
        },
        { maxRetries: 3, backoff: true }
      );
    },
    { action: 'load critical data' }
  );
  
  return { data, error };
};
```

### User-Initiated Retry

```typescript
const [loadError, setLoadError] = useState<string | null>(null);
const [isRetrying, setIsRetrying] = useState(false);

const loadData = async () => {
  setLoadError(null);
  const { error } = await handleAsyncOperation(
    async () => {
      const { data, error } = await supabase.from('table').select('*');
      if (error) throw error;
      setData(data);
    },
    { action: 'load data' }
  );
  
  if (error) {
    setLoadError(error);
  }
};

// In render:
{loadError && (
  <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
    <p className="text-destructive mb-2">{loadError}</p>
    <Button 
      onClick={() => {
        setIsRetrying(true);
        loadData().finally(() => setIsRetrying(false));
      }}
      disabled={isRetrying}
      variant="outline"
    >
      {isRetrying ? 'Retrying...' : 'Try Again'}
    </Button>
  </div>
)}
```

---

## Phase 6: Logging & Monitoring

### Client-Side Error Logging

```typescript
// src/lib/errorLogger.ts
import { useErrorLogger } from '@/hooks/useErrorLogger';

export const logClientError = async (
  error: Error,
  context: {
    component: string;
    action: string;
    metadata?: Record<string, any>;
  }
) => {
  const { logComponentError } = useErrorLogger();
  
  // Log to Supabase
  await logComponentError(context.component, error, {
    action: context.action,
    ...context.metadata
  });
  
  // Also log to console in development
  if (import.meta.env.DEV) {
    console.error(`[${context.component}] ${context.action}:`, error);
  }
};
```

### Error Boundary with Logging

```typescript
// Update ErrorBoundary to use error logger
componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
  logClientError(error, {
    component: 'ErrorBoundary',
    action: 'component_crash',
    metadata: { errorInfo }
  });
  
  if (this.props.onError) {
    this.props.onError(error, errorInfo);
  }
}
```

---

## Testing Checklist

### Manual Testing

```typescript
// Test 1: Network Failure
// - Disconnect internet
// - Try to submit a form
// - Expected: User-friendly "connection error" message
// - Click "Try Again" when reconnected
// - Expected: Form submits successfully

// Test 2: Invalid Data
// - Submit form with invalid data
// - Expected: Specific validation error message
// - Not: Generic "something went wrong"

// Test 3: Permission Denied
// - Try to access admin page as regular user
// - Expected: "You don't have permission" message
// - Not: Silent failure or crash

// Test 4: Session Expired
// - Let session expire (or manually clear)
// - Try to perform action
// - Expected: Redirect to login with message
```

### Automated Error Scenarios

```typescript
// src/__tests__/errorHandling.test.ts
describe('Error Handling', () => {
  it('shows user-friendly message on network error', async () => {
    // Mock network failure
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Failed to fetch'));
    
    render(<YourComponent />);
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    expect(await screen.findByText(/connection error/i)).toBeInTheDocument();
  });

  it('allows retry after error', async () => {
    let callCount = 0;
    vi.spyOn(supabase.from('table'), 'insert').mockImplementation(() => {
      callCount++;
      if (callCount === 1) throw new Error('Network error');
      return { data: {}, error: null };
    });
    
    render(<YourComponent />);
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    await userEvent.click(screen.getByRole('button', { name: /try again/i }));
    
    expect(await screen.findByText(/success/i)).toBeInTheDocument();
  });
});
```

---

## Success Criteria

✅ All async operations use `handleAsyncOperation`
✅ All user actions have loading states
✅ Error messages are user-friendly, not technical
✅ Users can retry failed operations
✅ Skeleton loaders for all data-heavy pages
✅ Errors logged to Supabase for monitoring
✅ No unhandled promise rejections in console
✅ ErrorBoundary catches all React errors

---

## Timeline

- **Week 1**: Update high-priority user-facing operations
- **Week 2**: Add loading states and skeleton loaders
- **Week 3**: Implement retry logic and error recovery
- **Week 4**: Testing and refinement
