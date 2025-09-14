export function isDemoMode(): boolean {
  return process.env.DISABLE_ADD === 'true';
}

export function getDemoModeError() {
  return {
    message: 'This Commonbase is for demonstration purposes only.',
    action: 'Create your own at https://github.com/your-commonbase/commonbase'
  };
}