# FounderBuilt Frontend Implementation (Next.js)

- [ ] **Setup & Configuration**
    - [X] Create Next.js project (`founderbuilt-app`)
    - [X] Install Supabase client library (`@supabase/supabase-js`)
    - [X] Configure Supabase client (environment variables)
    - [X] Configure Stripe client (environment variables)
    - [X] Set up basic layout component (`src/components/Layout.tsx`)
    - [X] Configure Tailwind CSS (already part of template)
    - [X] Configure shadcn/ui (already part of template)

- [ ] **Authentication Pages & Flow**
    - [X] Create Signup page (`src/app/signup/page.tsx`)
        - [X] Role selection (Founder/Recruiter)
        - [X] Google SSO button
    - [X] Create Login page (`src/app/login/page.tsx`)
        - [X] Google SSO button
    - [X] Implement authentication logic using Supabase Auth (Middleware setup)
    - [X] Create "Pending Approval" page for founders (`src/app/pending-approval/page.tsx`)
    - [X] Implement protected routes/redirects based on auth status and role (Basic setup)

- [ ] **Core Pages (Founder/Recruiter Shared)**
    - [X] Create Homepage (`src/app/page.tsx`) - Display community guidelines for approved founders, maybe generic welcome for others.
    - [X] Create Directory page (`src/app/directory/page.tsx`)
        - [X] Fetch and display founder list (Placeholder)
        - [X] Implement recruiter view restrictions (free vs. paid) (Placeholder)
    - [X] Create Job Board page (`src/app/jobs/page.tsx`)
        - [X] Fetch and display active jobs (Placeholder)
        - [X] Implement sorting (date) (Placeholder)
        - [X] Implement filtering (type, geography) (Placeholder)
    - [X] Create Events page (`src/app/events/page.tsx`)
        - [X] Integrate Lu.ma event display (Placeholder iframe)

- [ ] **Founder Specific Features**
    - [ ] Create Founder Application form (part of profile or separate page?)
    - [ ] Implement profile completion nudges
    - [ ] Display "Verified" badge

- [ ] **Recruiter Specific Features**
    - [X] Create Job Posting form (`src/app/jobs/post/page.tsx`) (Placeholder)
    - [X] Implement Upgrade to Paid Tier flow (Stripe integration) (Placeholder page)

- [X] **User Profile & Settings**
    - [X] Create Profile Settings page (`src/app/settings/profile/page.tsx`)
        - [X] Form to update profile info (LinkedIn, photo, name, location, etc.) (Placeholder)
        - [X] Specific fields for Founders (open roles, industry, funding, expertise) (Placeholder)

- [ ] **Admin Dashboard (Integrated)**
    - [X] Create Admin section layout/routing (`src/app/admin/...`) (Layout component created)
    - [X] Implement access control (admin role only) (Placeholder in layout)
    - [X] Founder Approval page (`src/app/admin/approvals/page.tsx`) (Placeholder)
    - [X] User Management page (Founders & Recruiters) (`src/app/admin/users/page.tsx`) - View, Edit, Delete (Placeholder)
    - [X] Job Management page (`src/app/admin/jobs/page.tsx`) - View, Edit, Delete (Placeholder)
    - [X] Admin Management page (`src/app/admin/admins/page.tsx`) - Add/Remove Admins (Placeholder)
    - [X] Recruiter Tier Management page (`src/app/admin/recruiters/page.tsx`) - View status, Manual override (Placeholder)

- [ ] **Common Components**
    - [ ] Navigation Bar
    - [ ] Footer
    - [ ] User Card (for directory)
    - [ ] Job Card (for job board)
    - [ ] Forms (using shadcn/ui)
    - [ ] Buttons, Modals, etc. (using shadcn/ui)

- [ ] **Error Handling**
    - [ ] Implement 404 page
    - [ ] Implement general error handling page/component

- [ ] **Static Pages**
    - [ ] Terms of Use page
    - [ ] Privacy Policy page




- [ ] **Responsiveness & Styling Pass**
    - [X] Review Layout (`Layout.tsx`) for mobile/tablet sizes (navbar, padding, footer)
    - [X] Review Auth Pages (`signup`, `login`, `pending-approval`) for responsiveness
    - [X] Review Homepage (`page.tsx`) for responsiveness
    - [X] Review Directory Page (`directory/page.tsx`) for responsiveness (card layout)
    - [X] Review Job Board Page (`jobs/page.tsx`) for responsiveness (filters, card layout)
    - [X] Review Events Page (`events/page.tsx`) for responsiveness (iframe container)
    - [X] Review Settings Pages (`settings/profile`, `settings/subscription`) for form responsiveness
    - [X] Review Admin Layout (`admin/layout.tsx`) for mobile/tablet (sidebar/main split)
    - [X] Review Admin Tables (`approvals`, `users`, `jobs`, `admins`, `recruiters`) for responsiveness (consider horizontal scrolling or card view on small screens)

