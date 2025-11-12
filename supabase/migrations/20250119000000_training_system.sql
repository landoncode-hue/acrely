-- Training and Documentation System Schema
-- Manages user onboarding, training progress, and feedback

-- User Settings table (stores onboarding completion and preferences)
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_completed_at TIMESTAMPTZ,
  show_tooltips BOOLEAN DEFAULT TRUE,
  preferred_help_language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- User Feedback table (collects user feedback, bug reports, feature requests)
CREATE TABLE public.user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('feedback', 'bug_report', 'feature_request', 'help_request')),
  category TEXT NOT NULL CHECK (category IN ('dashboard', 'customers', 'allocations', 'payments', 'reports', 'mobile', 'general')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'in_progress', 'resolved', 'closed')),
  admin_notes TEXT,
  resolved_by UUID REFERENCES public.users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Help Article Views tracking (anonymous analytics)
CREATE TABLE public.help_article_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_slug TEXT NOT NULL,
  user_role TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Training Progress table (tracks completion of training modules)
CREATE TABLE public.training_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  module_name TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  time_spent_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

-- Indexes for performance
CREATE INDEX idx_user_settings_user_id ON public.user_settings(user_id);
CREATE INDEX idx_user_feedback_user_id ON public.user_feedback(user_id);
CREATE INDEX idx_user_feedback_status ON public.user_feedback(status);
CREATE INDEX idx_user_feedback_type ON public.user_feedback(type);
CREATE INDEX idx_help_article_views_slug ON public.help_article_views(article_slug);
CREATE INDEX idx_training_progress_user_id ON public.training_progress(user_id);

-- RLS Policies for user_settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for user_feedback
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own feedback"
  ON public.user_feedback FOR SELECT
  USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('CEO', 'MD', 'SysAdmin')
    )
  );

CREATE POLICY "Users can insert own feedback"
  ON public.user_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update feedback"
  ON public.user_feedback FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('CEO', 'MD', 'SysAdmin')
    )
  );

-- RLS Policies for help_article_views
ALTER TABLE public.help_article_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log article views"
  ON public.help_article_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view article analytics"
  ON public.help_article_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('CEO', 'MD', 'SysAdmin')
    )
  );

-- RLS Policies for training_progress
ALTER TABLE public.training_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own training progress"
  ON public.training_progress FOR SELECT
  USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('CEO', 'MD', 'SysAdmin')
    )
  );

CREATE POLICY "Users can insert own training progress"
  ON public.training_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own training progress"
  ON public.training_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to auto-create user settings on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create settings for new users
CREATE TRIGGER on_user_created_settings
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_settings();

-- Function to notify admins of urgent feedback
CREATE OR REPLACE FUNCTION public.notify_admin_urgent_feedback()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.priority = 'urgent' OR NEW.type = 'bug_report' THEN
    INSERT INTO public.notifications (user_id, title, message, type, link)
    SELECT 
      id,
      'Urgent Feedback Received',
      'User ' || (SELECT full_name FROM public.users WHERE id = NEW.user_id) || ' submitted: ' || NEW.title,
      'warning',
      '/dashboard/feedback'
    FROM public.users
    WHERE role IN ('CEO', 'MD', 'SysAdmin');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to notify admins
CREATE TRIGGER on_urgent_feedback_created
  AFTER INSERT ON public.user_feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_urgent_feedback();

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_training_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
CREATE TRIGGER update_user_settings_timestamp
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_training_timestamp();

CREATE TRIGGER update_user_feedback_timestamp
  BEFORE UPDATE ON public.user_feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.update_training_timestamp();

CREATE TRIGGER update_training_progress_timestamp
  BEFORE UPDATE ON public.training_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_training_timestamp();

-- Comments for documentation
COMMENT ON TABLE public.user_settings IS 'Stores user preferences and onboarding status';
COMMENT ON TABLE public.user_feedback IS 'Collects user feedback, bug reports, and feature requests';
COMMENT ON TABLE public.help_article_views IS 'Tracks help article view analytics';
COMMENT ON TABLE public.training_progress IS 'Tracks user progress through training modules';
