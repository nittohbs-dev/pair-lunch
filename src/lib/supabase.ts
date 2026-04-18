import { createClient } from '@supabase/supabase-js'

// ランタイム環境変数（HTML注入）とビルド時環境変数の両方に対応
// @ts-ignore
const supabaseUrl = window.__env__?.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL
// @ts-ignore
const supabaseAnonKey = window.__env__?.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

// ここでエラーが出るのを防ぐためのチェック
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("環境変数が読み込めていません。 .envファイルと再起動を確認してください。")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)