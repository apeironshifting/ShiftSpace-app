supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      name,
      username
    }
  }
})
