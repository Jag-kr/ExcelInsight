import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

/**
 * IMPLEMENTATION EXAMPLES & PATTERNS
 * Copy and adapt these patterns to fix responsive issues in your components
 */

// ============================================================================
// PATTERN 1: Responsive Chart Title with Overflow Handling
// ============================================================================
/**
 * Problem: Chart titles overflow and break layout on mobile
 * Solution: Truncate with tooltip, use responsive font sizes
 * 
 * Usage in DynamicChart.tsx:
 */
export function ResponsiveTitlePattern() {
  const title = "This is a very long chart title that will overflow";
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <h2 className="text-sm sm:text-base lg:text-lg font-semibold truncate">
            {title}
          </h2>
        </TooltipTrigger>
        <TooltipContent side="bottom">{title}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ============================================================================
// PATTERN 2: Responsive Dashboard Grid
// ============================================================================
/**
 * Problem: Dashboard items don't stack properly on mobile
 * Solution: Use responsive grid with 1 col mobile, 2 cols tablet, 3-4 cols desktop
 * 
 * Usage in DashboardGrid.tsx (replace the grid container):
 */
export function ResponsiveDashboardGridPattern() {
  const items = []; // your items
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 auto-rows-max">
      {/* Your dashboard items */}
    </div>
  );
}

// ============================================================================
// PATTERN 3: Responsive Chart Controls (Buttons/Toolbar)
// ============================================================================
/**
 * Problem: Chart controls overflow on mobile screens
 * Solution: Stack vertically on mobile, horizontally on desktop; use icon-only buttons
 * 
 * Usage in DynamicChart.tsx (for button toolbar):
 */
export function ResponsiveChartControlsPattern() {
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-wrap items-start sm:items-center">
      {/* Icon-only on mobile (sm:p-2), with labels on larger screens */}
      <button className="flex items-center gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 rounded text-xs sm:text-sm">
        <span className="block sm:hidden">📊</span>
        <span className="hidden sm:inline">Change Type</span>
      </button>
      
      {/* Or use a dropdown on mobile */}
      <select className="w-full sm:w-auto h-9 text-xs sm:text-sm">
        <option>Select Chart Type</option>
      </select>
    </div>
  );
}

// ============================================================================
// PATTERN 4: Responsive Table with Horizontal Scroll
// ============================================================================
/**
 * Problem: Tables are too narrow and cramped on mobile
 * Solution: Wrap in scrollable container on mobile, normal on desktop
 * 
 * Usage in DashboardTable (inside DashboardGrid.tsx):
 */
export function ResponsiveTablePattern() {
  return (
    <div className="overflow-x-auto sm:overflow-visible w-full">
      <table className="w-full text-xs sm:text-sm min-w-[400px] sm:min-w-0">
        <thead>
          <tr>
            <th className="px-2 py-1 sm:px-4 sm:py-2">Column 1</th>
            <th className="px-2 py-1 sm:px-4 sm:py-2">Column 2</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-2 py-1 sm:px-4 sm:py-2 truncate">Data</td>
            <td className="px-2 py-1 sm:px-4 sm:py-2 truncate">Data</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// PATTERN 5: Responsive File Upload
// ============================================================================
/**
 * Problem: Upload box has too much padding on mobile
 * Solution: Reduce padding on mobile, increase on desktop
 * 
 * Usage in FileUpload.tsx:
 */
export function ResponsiveFileUploadPattern() {
  return (
    <label className="flex cursor-pointer flex-col items-center justify-center gap-2 sm:gap-4 rounded-xl border-2 border-dashed p-6 sm:p-12 transition-all">
      <div className="rounded-full bg-primary/10 p-3 sm:p-4">
        {/* Icon here */}
      </div>
      <div className="text-center">
        <p className="text-base sm:text-lg font-semibold">Upload File</p>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Drag and drop or click to browse
        </p>
      </div>
      <input type="file" className="hidden" />
    </label>
  );
}

// ============================================================================
// PATTERN 6: Responsive Modal/Dialog
// ============================================================================
/**
 * Problem: Modals overflow or are misaligned on mobile
 * Solution: Use responsive padding and width
 * 
 * Usage in Dialog components:
 */
export function ResponsiveDialogPattern() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Dialog Content */}
      <div className="relative bg-white rounded-lg shadow-lg w-full sm:w-auto sm:max-w-md max-h-[90vh] overflow-y-auto p-6 sm:p-8">
        {/* Your content */}
      </div>
    </div>
  );
}

// ============================================================================
// PATTERN 7: Responsive Main Page Layout
// ============================================================================
/**
 * Problem: Overall page structure not responsive
 * Solution: Stack sections vertically on mobile, use responsive padding
 * 
 * Usage in app/page.tsx:
 */
export function ResponsivePageLayoutPattern() {
  return (
    <main className="min-h-screen w-full">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        {/* Navigation content */}
      </header>

      {/* Main Content */}
      <div className="w-full max-w-full sm:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Flex stack: vertical on mobile, horizontal on desktop */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          {/* Left panel */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            {/* Sidebar content */}
          </aside>

          {/* Main content area */}
          <div className="flex-1 min-w-0">
            {/* Responsive grid for tabs/sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Content */}
            </div>
          </div>
        </div>
      </div>

      {/* Safe area for mobile (accounts for notches, etc.) */}
      <div className="h-8 sm:h-0" />
    </main>
  );
}

// ============================================================================
// PATTERN 8: Responsive Data Filter
// ============================================================================
/**
 * Problem: Filter controls wrap awkwardly
 * Solution: Already mostly good, just ensure dropdowns don't overflow
 * 
 * Improvement for DataFilter.tsx:
 */
export function ResponsiveDataFilterPattern() {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
        <h3 className="text-xs sm:text-sm font-semibold">Filter Data</h3>
        <button className="text-xs h-7 w-full sm:w-auto">Clear All</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Filter items */}
      </div>
    </div>
  );
}

// ============================================================================
// PATTERN 9: Editable Title with Responsive Input
// ============================================================================
/**
 * Problem: Title inputs overflow on mobile
 * Solution: Make input responsive and handle long text
 * 
 * Usage in EditableTitle (DashboardGrid.tsx):
 */
export function ResponsiveEditableTitlePattern() {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState("Title");

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        className="h-7 sm:h-8 text-xs sm:text-sm font-semibold w-full max-w-full px-2 py-1 border rounded"
        maxLength={100}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="text-left truncate hover:underline text-xs sm:text-sm font-semibold w-full"
      title={draft}
    >
      {draft}
    </button>
  );
}

// ============================================================================
// PATTERN 10: Responsive Icon/Label Toggle
// ============================================================================
/**
 * Problem: Labels take too much space on mobile
 * Solution: Show icons on mobile, icons+labels on desktop
 * 
 * Usage in any toolbar:
 */
export function ResponsiveIconLabelPattern() {
  return (
    <button className="flex items-center gap-1.5 px-2 py-1.5 sm:px-4 sm:py-2 rounded hover:bg-secondary">
      {/* Icon always shown */}
      <span className="w-4 h-4 flex-shrink-0">📊</span>
      
      {/* Label hidden on mobile */}
      <span className="hidden sm:inline text-xs sm:text-sm font-medium">
        Action Label
      </span>
    </button>
  );
}

/**
 * ============================================================================
 * ADDITIONAL TIPS
 * ============================================================================
 * 
 * 1. MOBILE-FIRST APPROACH:
 *    - Start with mobile styles (no prefix)
 *    - Add larger screen styles with sm:, md:, lg: prefixes
 *    - Example: "text-xs sm:text-sm lg:text-base"
 * 
 * 2. TOUCH TARGETS:
 *    - Minimum 44x44px for touch-friendly buttons
 *    - Use h-11 w-11 on mobile, h-10 w-10 on desktop
 * 
 * 3. TEXT OVERFLOW:
 *    - Use truncate with tooltip for long text
 *    - Use line-clamp-2 sm:line-clamp-none for multi-line
 *    - Always provide title attribute for truncated text
 * 
 * 4. SPACING:
 *    - Use responsive padding: p-4 sm:p-6 lg:p-8
 *    - Use responsive gaps: gap-3 sm:gap-4 lg:gap-6
 *    - Account for safe areas on mobile (bottom padding)
 * 
 * 5. TESTING:
 *    - Test on Chrome DevTools at 375px (iPhone 12)
 *    - Test at 768px (iPad)
 *    - Test at 1920px (Desktop)
 *    - Test in landscape orientation
 * 
 * 6. SCROLLING:
 *    - Never force horizontal scroll unless necessary
 *    - Use overflow-x-auto only for intentional scroll areas
 *    - Provide visual indication of scrollable content
 * 
 * ============================================================================
 */
