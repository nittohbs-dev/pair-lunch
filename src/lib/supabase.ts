import { createClient } from '@supabase/supabase-js'

// Viteの場合は import.meta.env を使う
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// ここでエラーが出るのを防ぐためのチェック
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("環境変数が読み込めていません。 .envファイルと再起動を確認してください。")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)