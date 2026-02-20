// Types for EVA tool events received via WebSocket

export interface ToolEvent {
  id: string;
  tool: string;
  toolData: Record<string, unknown>;
  status: 'executing' | 'success' | 'error';
  timestamp: number;
}

// Tool category mapping
export type ToolCategory =
  | 'search'
  | 'email'
  | 'messaging'
  | 'video'
  | 'music'
  | 'calendar'
  | 'tasks'
  | 'maps'
  | 'drive'
  | 'timer'
  | 'entertainment'
  | 'games'
  | 'wellness'
  | 'habits'
  | 'medication'
  | 'clinical'
  | 'camera'
  | 'emergency'
  | 'education'
  | 'legal'
  | 'kids'
  | 'code'
  | 'database'
  | 'browser'
  | 'smarthome'
  | 'messaging_advanced'
  | 'webhooks'
  | 'skills'
  | 'selfaware'
  | 'execute'
  | 'generic';

export const TOOL_CATEGORY_MAP: Record<string, ToolCategory> = {
  // Phase 1 - Communication & Search
  web_search: 'search',
  browse_webpage: 'search',
  show_webpage: 'search',
  google_search_retrieval: 'search',
  send_email: 'email',
  send_whatsapp: 'messaging',
  send_telegram: 'messaging',
  search_videos: 'video',
  play_video: 'video',
  play_music: 'music',

  // Phase 2 - Productivity & Location
  manage_calendar_event: 'calendar',
  schedule_appointment: 'calendar',
  pending_schedule: 'calendar',
  confirm_schedule: 'calendar',
  capture_task: 'tasks',
  list_tasks: 'tasks',
  complete_task: 'tasks',
  clarify_task: 'tasks',
  set_alarm: 'tasks',
  cancel_alarm: 'tasks',
  list_alarms: 'tasks',
  find_nearby_places: 'maps',
  search_places: 'maps',
  get_directions: 'maps',
  nearby_transport: 'maps',
  save_to_drive: 'drive',
  create_health_doc: 'drive',
  manage_health_sheet: 'drive',
  pomodoro_timer: 'timer',

  // Phase 3 - Entertainment & Wellness
  play_nostalgic_music: 'music',
  play_radio_station: 'music',
  nature_sounds: 'music',
  religious_content: 'entertainment',
  read_newspaper: 'entertainment',
  daily_horoscope: 'entertainment',
  play_trivia_game: 'games',
  memory_game: 'games',
  word_association: 'games',
  brain_training: 'games',
  guided_meditation: 'wellness',
  breathing_exercises: 'wellness',
  wim_hof_breathing: 'wellness',
  chair_exercises: 'wellness',
  log_habit: 'habits',
  log_water: 'habits',
  habit_stats: 'habits',
  habit_summary: 'habits',

  // Phase 4 - Health & Clinical
  confirm_medication: 'medication',
  scan_medication_visual: 'medication',
  apply_phq9: 'clinical',
  apply_gad7: 'clinical',
  apply_cssrs: 'clinical',
  submit_phq9_response: 'clinical',
  submit_gad7_response: 'clinical',
  open_camera_analysis: 'camera',

  // Phase 5 - Emergency
  alert_family: 'emergency',
  call_family_webrtc: 'emergency',
  call_central_webrtc: 'emergency',
  call_doctor_webrtc: 'emergency',
  call_caregiver_webrtc: 'emergency',

  // Phase 6 - Education, Legal, Kids
  explain_concept: 'education',
  create_cognitive_exercise: 'education',
  check_learning_progress: 'education',
  study_topic: 'education',
  add_to_curriculum: 'education',
  list_curriculum: 'education',
  search_knowledge: 'education',
  get_elderly_rights: 'legal',
  document_status: 'legal',
  explain_legal_term: 'legal',
  kids_mission_create: 'kids',
  kids_mission_complete: 'kids',
  kids_missions_pending: 'kids',
  kids_stats: 'kids',
  kids_learn: 'kids',
  kids_quiz: 'kids',
  kids_story: 'kids',

  // Phase 7 - Advanced/Debug
  edit_my_code: 'code',
  search_my_code: 'code',
  read_file: 'code',
  write_file: 'code',
  list_files: 'code',
  search_files: 'code',
  create_branch: 'code',
  commit_code: 'code',
  run_tests: 'code',
  get_code_diff: 'code',
  query_nietzsche: 'database',
  query_nietzsche_graph: 'database',
  query_nietzsche_vector: 'database',
  query_postgresql: 'database',
  run_sql_select: 'database',
  query_my_database: 'database',
  list_my_collections: 'database',
  browser_navigate: 'browser',
  browser_fill_form: 'browser',
  browser_extract: 'browser',
  smart_home_control: 'smarthome',
  smart_home_status: 'smarthome',
  send_slack: 'messaging_advanced',
  send_discord: 'messaging_advanced',
  send_teams: 'messaging_advanced',
  send_signal: 'messaging_advanced',
  create_webhook: 'webhooks',
  list_webhooks: 'webhooks',
  trigger_webhook: 'webhooks',
  create_skill: 'skills',
  list_skills: 'skills',
  execute_skill: 'skills',
  delete_skill: 'skills',
  search_self_knowledge: 'selfaware',
  update_self_knowledge: 'selfaware',
  introspect: 'selfaware',
  search_my_docs: 'selfaware',
  system_stats: 'selfaware',
  execute_code: 'execute',
  control_ui: 'generic',

  // --- NotifyFunc async result msgTypes (backend → browser via BrowserNotifiers) ---
  // Search
  web_search_result: 'search',
  web_search_error: 'search',
  // Email
  email_sent: 'email',
  email_error: 'email',
  new_email: 'email',
  // Video
  video_error: 'video',
  // Messaging
  whatsapp_sent: 'messaging',
  whatsapp_error: 'messaging',
  telegram_sent: 'messaging',
  telegram_error: 'messaging',
  // Messaging Advanced
  slack_sent: 'messaging_advanced',
  slack_error: 'messaging_advanced',
  discord_sent: 'messaging_advanced',
  discord_error: 'messaging_advanced',
  teams_sent: 'messaging_advanced',
  teams_error: 'messaging_advanced',
  signal_sent: 'messaging_advanced',
  signal_error: 'messaging_advanced',
  // Calendar
  calendar_event_created: 'calendar',
  // Drive
  drive_saved: 'drive',
  drive_error: 'drive',
  // Maps
  places_found: 'maps',
  places_error: 'maps',
  // Music
  play_radio: 'music',
  play_nature_sound: 'music',
  play_spotify: 'music',
  // Entertainment
  play_religious: 'entertainment',
  play_audiobook: 'entertainment',
  pause_audiobook: 'entertainment',
  resume_audiobook: 'entertainment',
  play_podcast: 'entertainment',
  pause_podcast: 'entertainment',
  resume_podcast: 'entertainment',
  play_sleep_story: 'entertainment',
  show_family_tree: 'entertainment',
  start_slideshow: 'entertainment',
  pause_slideshow: 'entertainment',
  stop_slideshow: 'entertainment',
  select_photo_for_biography: 'entertainment',
  start_voice_recording: 'entertainment',
  start_diary_recording: 'entertainment',
  // Wellness
  start_meditation: 'wellness',
  start_breathing: 'wellness',
  start_wim_hof: 'wellness',
  start_exercises: 'wellness',
  // Timer
  start_pomodoro: 'timer',
  // Tasks
  alarm_set: 'tasks',
  alarm_cancelled: 'tasks',
  gtd_task_created: 'tasks',
  gtd_task_completed: 'tasks',
  // Habits
  habit_logged: 'habits',
  water_logged: 'habits',
  // Medication
  open_medication_scanner: 'medication',
  // Clinical
  high_depression_score: 'clinical',
  high_anxiety_score: 'clinical',
  cssrs_completed: 'clinical',
  // Emergency
  suicide_risk_detected: 'emergency',
  critical_suicide_risk: 'emergency',
  critical_alert: 'emergency',
  initiate_call: 'emergency',
  // Education
  language_lesson: 'education',
  // Code / Sandbox
  code_result: 'code',
  code_error: 'code',
  // Browser / Sandbox
  browser_result: 'browser',
  browser_error: 'browser',
  form_submitted: 'browser',
  extract_result: 'browser',
  // Database
  nietzsche_result: 'database',
  nietzsche_error: 'database',
  // Smart Home
  smart_home_controlled: 'smarthome',
  smart_home_error: 'smarthome',
  // Webhooks
  webhook_triggered: 'webhooks',
  webhook_error: 'webhooks',
  // Skills
  skill_result: 'skills',
  skill_error: 'skills',
  // Self-aware
  memory_captured: 'selfaware',
  llm_response: 'selfaware',
  llm_error: 'selfaware',
};

export function getToolCategory(toolName: string): ToolCategory {
  return TOOL_CATEGORY_MAP[toolName] || 'generic';
}

// Quick action definitions for the sidebar
export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  command: string;
  category: ToolCategory;
  color: string;
}

export const QUICK_ACTIONS: QuickAction[] = [
  { id: 'search', label: 'Buscar na Web', icon: 'Search', command: 'pesquise na web sobre', category: 'search', color: 'blue' },
  { id: 'email', label: 'Enviar Email', icon: 'Mail', command: 'envie um email para', category: 'email', color: 'red' },
  { id: 'whatsapp', label: 'WhatsApp', icon: 'MessageCircle', command: 'envie whatsapp para', category: 'messaging', color: 'green' },
  { id: 'music', label: 'Tocar Música', icon: 'Music', command: 'toque a música', category: 'music', color: 'purple' },
  { id: 'video', label: 'Buscar Vídeo', icon: 'Play', command: 'busque vídeo de', category: 'video', color: 'red' },
  { id: 'calendar', label: 'Calendário', icon: 'Calendar', command: 'mostre meus compromissos', category: 'calendar', color: 'blue' },
  { id: 'tasks', label: 'Tarefas', icon: 'CheckSquare', command: 'liste minhas tarefas', category: 'tasks', color: 'amber' },
  { id: 'alarm', label: 'Alarme', icon: 'Bell', command: 'defina um alarme para', category: 'tasks', color: 'orange' },
  { id: 'map', label: 'Lugares', icon: 'MapPin', command: 'encontre lugares próximos', category: 'maps', color: 'teal' },
  { id: 'directions', label: 'Direções', icon: 'Navigation', command: 'como chegar em', category: 'maps', color: 'teal' },
  { id: 'meditation', label: 'Meditação', icon: 'Flower2', command: 'inicie meditação guiada', category: 'wellness', color: 'violet' },
  { id: 'breathing', label: 'Respiração', icon: 'Wind', command: 'exercício de respiração', category: 'wellness', color: 'cyan' },
  { id: 'trivia', label: 'Trivia', icon: 'HelpCircle', command: 'jogue trivia comigo', category: 'games', color: 'yellow' },
  { id: 'newspaper', label: 'Notícias', icon: 'Newspaper', command: 'leia as notícias do dia', category: 'entertainment', color: 'gray' },
  { id: 'medication', label: 'Medicação', icon: 'Pill', command: 'mostre meus medicamentos', category: 'medication', color: 'rose' },
  { id: 'water', label: 'Água', icon: 'Droplets', command: 'registrar copo de água', category: 'habits', color: 'sky' },
  { id: 'habit', label: 'Hábitos', icon: 'TrendingUp', command: 'resumo dos meus hábitos', category: 'habits', color: 'lime' },
  { id: 'pomodoro', label: 'Pomodoro', icon: 'Timer', command: 'iniciar pomodoro', category: 'timer', color: 'red' },
  { id: 'study', label: 'Estudar', icon: 'BookOpen', command: 'me ensine sobre', category: 'education', color: 'indigo' },
  { id: 'rights', label: 'Direitos', icon: 'Scale', command: 'meus direitos como idoso', category: 'legal', color: 'stone' },
  { id: 'sos', label: 'SOS', icon: 'AlertTriangle', command: 'emergência', category: 'emergency', color: 'red' },
];
