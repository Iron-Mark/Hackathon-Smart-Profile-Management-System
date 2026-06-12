type DemoRow = Record<string, any>;

interface DemoAuthUser {
  id: string;
  email: string;
  password: string;
}

export interface DemoStoredFile {
  bucket: string;
  path: string;
  name: string;
  updated_at: string;
  type?: string;
  size?: number;
  dataUrl?: string;
}

interface DemoState {
  currentUserId: string | null;
  nextId: number;
  authUsers: DemoAuthUser[];
  tables: Record<string, DemoRow[]>;
  storage: Record<string, DemoStoredFile>;
}

const DEMO_STORAGE_KEY = 'smart-profile-demo-state-v1';
const DEMO_PREVIEW_MAX_BYTES = 1024 * 1024;
let memoryState: DemoState | null = null;

const demoNow = () => new Date().toISOString();

const normalizeAppBasePath = () => {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const normalized = baseUrl.replace(/\/+$/, '');
  return normalized === '' ? '' : normalized;
};

const encodeStoragePath = (filePath: string) =>
  filePath
    .split('/')
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join('/');

const createDemoStorageUrl = (bucket: string, filePath: string, expiresIn?: number) => {
  const basePath = normalizeAppBasePath();
  const query = expiresIn ? `?expiresIn=${encodeURIComponent(String(expiresIn))}` : '';
  return `${basePath}/demo-storage/${encodeURIComponent(bucket)}/${encodeStoragePath(filePath)}${query}`;
};

const blobToDataUrl = (file: Blob) =>
  new Promise<string | undefined>((resolve) => {
    if (typeof FileReader === 'undefined') {
      resolve(undefined);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      resolve(typeof reader.result === 'string' ? reader.result : undefined);
    };
    reader.onerror = () => resolve(undefined);
    reader.readAsDataURL(file);
  });

const seedState = (): DemoState => ({
  currentUserId: null,
  nextId: 100,
  authUsers: [
    { id: 'demo-admin-1', email: 'admin@umak.edu.ph', password: 'Admin123' },
    { id: 'demo-faculty-1', email: 'faculty@umak.edu.ph', password: 'Faculty123' },
  ],
  tables: {
    account_details: [
      {
        id: 'demo-admin-1',
        type: 'admin',
        name: 'Admin Reviewer',
        email: 'admin@umak.edu.ph',
      },
      {
        id: 'demo-faculty-1',
        type: 'faculty',
        name: 'Dr. Maria Santos',
        email: 'faculty@umak.edu.ph',
      },
    ],
    profile_details: [
      {
        id: 'demo-faculty-1',
        profession: 'Assistant Professor',
        description:
          'Faculty member focused on software engineering, applied research, and student mentorship.',
        status: 'accepted',
      },
    ],
    educational_background: [
      {
        id: 'demo-edu-1',
        user_id: 'demo-faculty-1',
        degree: 'M.S. Information Technology',
        institution: 'University of Makati',
        startDate: '2019-06-01',
        endDate: '2021-04-01',
      },
    ],
    work_experiences: [
      {
        id: 'demo-work-1',
        user_id: 'demo-faculty-1',
        role: 'Assistant Professor',
        organization: 'UMak CCIS',
        period: '2021 - Present',
        details: 'Handles software engineering and web development courses.',
      },
    ],
    professional_development: [
      {
        id: 'demo-dev-1',
        user_id: 'demo-faculty-1',
        role: 'Research Methods Workshop',
        organization: 'UMak CCIS',
        period: '2025',
        details: 'Completed training on academic research mentoring.',
      },
    ],
    submissions: [
      {
        id: 'demo-submission-1',
        user_id: 'demo-faculty-1',
        document_type: 'Diplomas',
        file_name: 'sample-diploma.png',
        status: 'Pending',
        created_at: demoNow(),
        submitted_at: demoNow(),
      },
    ],
    audit_logs: [
      {
        id: 'demo-log-1',
        user_id: 'SYSTEM',
        action: 'SETTINGS_CHANGE',
        details: 'Demo data seeded for local restoration flow',
        timestamp: demoNow(),
      },
    ],
  },
  storage: {
    'pictures-and-documents/demo-faculty-1/Diplomas/sample-diploma.png': {
      bucket: 'pictures-and-documents',
      path: 'demo-faculty-1/Diplomas/sample-diploma.png',
      name: 'sample-diploma.png',
      updated_at: demoNow(),
      type: 'image/png',
    },
  },
});

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const getLocalStorage = (): Storage | null => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }
  if (
    typeof window.localStorage.getItem !== 'function' ||
    typeof window.localStorage.setItem !== 'function'
  ) {
    return null;
  }
  return window.localStorage;
};

const readState = (): DemoState => {
  const storage = getLocalStorage();
  if (!storage) {
    memoryState ??= seedState();
    return clone(memoryState);
  }

  const stored = storage.getItem(DEMO_STORAGE_KEY);
  if (!stored) {
    const seeded = seedState();
    storage.setItem(DEMO_STORAGE_KEY, JSON.stringify(seeded));
    return clone(seeded);
  }

  try {
    return JSON.parse(stored) as DemoState;
  } catch {
    const seeded = seedState();
    storage.setItem(DEMO_STORAGE_KEY, JSON.stringify(seeded));
    return clone(seeded);
  }
};

const writeState = (state: DemoState) => {
  const storage = getLocalStorage();
  if (!storage) {
    memoryState = clone(state);
    return;
  }

  storage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
};

export function getDemoStoredFileFromUrl(pathname: string): DemoStoredFile | null {
  const basePath = normalizeAppBasePath();
  let appPath = pathname;

  if (basePath && appPath.startsWith(`${basePath}/`)) {
    appPath = appPath.slice(basePath.length);
  }

  const marker = '/demo-storage/';
  const markerIndex = appPath.indexOf(marker);
  if (markerIndex === -1) return null;

  const [encodedBucket, ...encodedPathParts] = appPath
    .slice(markerIndex + marker.length)
    .split('/')
    .filter(Boolean);

  if (!encodedBucket || encodedPathParts.length === 0) return null;

  const bucket = decodeURIComponent(encodedBucket);
  const filePath = encodedPathParts.map((part) => decodeURIComponent(part)).join('/');
  const state = readState();
  const stored = state.storage[`${bucket}/${filePath}`];

  return stored ? clone(stored) : null;
}

const userFromAuth = (authUser: DemoAuthUser | undefined | null) => {
  if (!authUser) return null;
  return {
    id: authUser.id,
    email: authUser.email,
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: demoNow(),
  };
};

const sessionFromAuth = (authUser: DemoAuthUser) => ({
  access_token: `demo-token-${authUser.id}`,
  refresh_token: `demo-refresh-${authUser.id}`,
  token_type: 'bearer',
  expires_in: 3600,
  user: userFromAuth(authUser),
});

const matches = (row: DemoRow, filters: DemoRow) =>
  Object.entries(filters).every(([key, value]) => row[key] === value);

const selectColumns = (row: DemoRow, columns?: string) => {
  if (!columns || columns === '*') return clone(row);

  return columns
    .split(',')
    .map((column) => column.trim())
    .filter(Boolean)
    .reduce<DemoRow>((selected, column) => {
      selected[column] = row[column];
      return selected;
    }, {});
};

const ensureTable = (state: DemoState, table: string) => {
  state.tables[table] ??= [];
  return state.tables[table];
};

class DemoSelectQuery {
  private filters: DemoRow = {};
  private table: string;
  private columns?: string;

  constructor(table: string, columns?: string) {
    this.table = table;
    this.columns = columns;
  }

  eq(column: string, value: unknown) {
    this.filters[column] = value;
    return this;
  }

  match(filters: DemoRow) {
    this.filters = { ...this.filters, ...filters };
    return this.execute();
  }

  async single() {
    const { data } = await this.execute();
    if (data.length === 0) {
      return { data: null, error: { message: 'No rows found' } };
    }

    return { data: data[0], error: null };
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: { data: DemoRow[]; error: null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ) {
    return this.execute().then(onfulfilled, onrejected);
  }

  private async execute() {
    const state = readState();
    const rows = ensureTable(state, this.table)
      .filter((row) => matches(row, this.filters))
      .map((row) => selectColumns(row, this.columns));

    return { data: rows, error: null };
  }
}

class DemoMutationQuery {
  private table: string;
  private operation: 'update' | 'delete';
  private payload?: DemoRow;

  constructor(table: string, operation: 'update' | 'delete', payload?: DemoRow) {
    this.table = table;
    this.operation = operation;
    this.payload = payload;
  }

  async match(filters: DemoRow) {
    const state = readState();
    const tableRows = ensureTable(state, this.table);

    if (this.operation === 'delete') {
      const kept = tableRows.filter((row) => !matches(row, filters));
      const removed = tableRows.filter((row) => matches(row, filters));
      state.tables[this.table] = kept;
      writeState(state);
      return { data: clone(removed), error: null };
    }

    const updated = tableRows.map((row) =>
      matches(row, filters) ? { ...row, ...this.payload } : row
    );
    state.tables[this.table] = updated;
    writeState(state);

    return {
      data: clone(updated.filter((row) => matches(row, { ...filters, ...this.payload }))),
      error: null,
    };
  }
}

const createTableClient = (table: string) => ({
  select: (columns?: string) => new DemoSelectQuery(table, columns),
  insert: async (input: DemoRow | DemoRow[]) => {
    const state = readState();
    const tableRows = ensureTable(state, table);
    const rows = Array.isArray(input) ? input : [input];

    const inserted = rows.map((row) => {
      const nextRow = { ...row };
      nextRow.id ??= `demo-${table}-${state.nextId++}`;
      if (table === 'submissions') {
        nextRow.created_at ??= demoNow();
        nextRow.submitted_at ??= demoNow();
      }
      if (table === 'audit_logs') {
        nextRow.timestamp ??= demoNow();
      }
      return nextRow;
    });

    tableRows.push(...inserted);
    writeState(state);
    return { data: clone(inserted), error: null };
  },
  update: (payload: DemoRow) => new DemoMutationQuery(table, 'update', payload),
  delete: () => new DemoMutationQuery(table, 'delete'),
});

const createStorageBucket = (bucket: string) => ({
  upload: async (filePath: string, file: Blob, _options?: DemoRow) => {
    const state = readState();
    const key = `${bucket}/${filePath}`;
    const name = filePath.split('/').pop() || filePath;
    const dataUrl = file.size <= DEMO_PREVIEW_MAX_BYTES ? await blobToDataUrl(file) : undefined;
    state.storage[key] = {
      bucket,
      path: filePath,
      name,
      updated_at: demoNow(),
      type: file.type,
      size: file.size,
      dataUrl,
    };
    writeState(state);

    return { data: { path: filePath }, error: null };
  },
  list: async (prefix = '') => {
    const state = readState();
    const normalizedPrefix = prefix.replace(/\/$/, '');
    const files = Object.values(state.storage)
      .filter((file) => file.bucket === bucket)
      .filter((file) => {
        if (!normalizedPrefix) return true;
        return file.path.startsWith(`${normalizedPrefix}/`);
      })
      .map((file) => ({
        name: file.name,
        updated_at: file.updated_at,
        metadata: { size: file.size, mimetype: file.type },
      }));

    return { data: files, error: null };
  },
  getPublicUrl: (filePath: string) => ({
    data: {
      publicUrl: createDemoStorageUrl(bucket, filePath),
    },
  }),
  createSignedUrl: async (filePath: string, expiresIn: number) => {
    const state = readState();
    const stored = state.storage[`${bucket}/${filePath}`];
    if (!stored) {
      return { data: null, error: { message: 'File not found' } };
    }

    return {
      data: {
        signedUrl: createDemoStorageUrl(bucket, filePath, expiresIn),
      },
      error: null,
    };
  },
  remove: async (paths: string[]) => {
    const state = readState();
    paths.forEach((filePath) => {
      delete state.storage[`${bucket}/${filePath}`];
    });
    writeState(state);

    return { data: paths, error: null };
  },
  download: async (filePath: string) => {
    const state = readState();
    const stored = state.storage[`${bucket}/${filePath}`];
    if (!stored) {
      return { data: null, error: { message: 'File not found' } };
    }

    return { data: new Blob(['demo file'], { type: stored.type || 'text/plain' }), error: null };
  },
});

export function resetDemoSupabaseState() {
  const storage = getLocalStorage();
  memoryState = seedState();
  if (storage) {
    storage.setItem(DEMO_STORAGE_KEY, JSON.stringify(memoryState));
  }
}

export function isDemoSupabaseEnabled(env: Record<string, string | undefined> = import.meta.env) {
  const explicitDemo = env.VITE_DEMO_MODE === 'true';
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const supabaseKey = env.VITE_SUPABASE_ANON_KEY;
  const missingSupabase = !supabaseUrl || !supabaseKey;
  const placeholderSupabase =
    supabaseUrl?.includes('your_supabase_project_url_here') ||
    supabaseUrl?.includes('dummy-project') ||
    supabaseKey?.includes('your_supabase_anon_key_here') ||
    supabaseKey?.includes('dummy-key');

  return explicitDemo || missingSupabase || placeholderSupabase;
}

export function createDemoSupabaseClient() {
  return {
    auth: {
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        const state = readState();
        const authUser = state.authUsers.find(
          (user) => user.email === email && user.password === password
        );

        if (!authUser) {
          return {
            data: { user: null, session: null },
            error: { message: 'Invalid demo credentials' },
          };
        }

        state.currentUserId = authUser.id;
        writeState(state);

        return {
          data: { user: userFromAuth(authUser), session: sessionFromAuth(authUser) },
          error: null,
        };
      },
      signUp: async ({ email, password }: { email: string; password: string }) => {
        const state = readState();
        const existing = state.authUsers.find((user) => user.email === email);
        if (existing) {
          return {
            data: { user: null, session: null },
            error: { message: 'Email already registered in demo mode' },
          };
        }

        const authUser = {
          id: `demo-user-${state.nextId++}`,
          email,
          password,
        };
        state.authUsers.push(authUser);
        state.currentUserId = authUser.id;
        writeState(state);

        return {
          data: { user: userFromAuth(authUser), session: sessionFromAuth(authUser) },
          error: null,
        };
      },
      getUser: async () => {
        const state = readState();
        const authUser = state.authUsers.find((user) => user.id === state.currentUserId);
        return { data: { user: userFromAuth(authUser) }, error: null };
      },
      updateUser: async ({ password }: { password?: string }) => {
        const state = readState();
        const authUser = state.authUsers.find((user) => user.id === state.currentUserId);
        if (!authUser) {
          return { data: { user: null }, error: { message: 'User not authenticated' } };
        }

        if (password) authUser.password = password;
        writeState(state);

        return { data: { user: userFromAuth(authUser) }, error: null };
      },
      signOut: async () => {
        const state = readState();
        state.currentUserId = null;
        writeState(state);
        return { error: null };
      },
    },
    from: (table: string) => createTableClient(table),
    storage: {
      from: (bucket: string) => createStorageBucket(bucket),
    },
    channel: () => ({
      on: function on() {
        return this;
      },
      subscribe: function subscribe() {
        return this;
      },
    }),
    removeChannel: async () => 'ok',
  };
}
