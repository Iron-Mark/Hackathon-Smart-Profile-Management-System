import { SEEDED_DEMO_ACCOUNTS } from '@/lib/demoAuth';

type DemoRow = Record<string, any>;
type DemoError = { message: string };
type DemoResult<T> = { data: T; error: DemoError | null };

interface DemoAuthUser {
  id: string;
  email: string;
  password: string;
  provider?: 'demo' | 'clerk';
}

export interface ClerkDemoIdentity {
  clerkUserId: string;
  email: string;
  name?: string | null;
}

export interface DemoUser {
  id: string;
  email: string;
  app_metadata: Record<string, never>;
  user_metadata: Record<string, never>;
  aud: 'authenticated';
  created_at: string;
}

export interface DemoSession {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  expires_in: number;
  user: DemoUser | null;
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

interface DemoStoredFileListItem {
  name: string;
  updated_at: string;
  metadata: {
    size?: number;
    mimetype?: string;
  };
}

interface DemoState {
  currentUserId: string | null;
  nextId: number;
  authUsers: DemoAuthUser[];
  tables: Record<string, DemoRow[]>;
  storage: Record<string, DemoStoredFile>;
}

interface DemoTableClient {
  select: (columns?: string) => DemoSelectQuery;
  insert: (input: DemoRow | DemoRow[]) => Promise<DemoResult<DemoRow[]>>;
  update: (payload: DemoRow) => DemoMutationQuery;
  delete: () => DemoMutationQuery;
}

interface DemoStorageBucket {
  upload: (
    filePath: string,
    file: Blob,
    options?: DemoRow
  ) => Promise<DemoResult<{ path: string }>>;
  list: (prefix?: string, options?: DemoRow) => Promise<DemoResult<DemoStoredFileListItem[]>>;
  getPublicUrl: (filePath: string) => { data: { publicUrl: string } };
  createSignedUrl: (
    filePath: string,
    expiresIn: number
  ) => Promise<DemoResult<{ signedUrl: string } | null>>;
  remove: (paths: string[]) => Promise<DemoResult<string[]>>;
  download: (filePath: string) => Promise<DemoResult<Blob | null>>;
}

interface DemoRealtimeChannel {
  on: (
    event?: string,
    filter?: DemoRow,
    callback?: (payload: any) => void
  ) => DemoRealtimeChannel;
  subscribe: () => DemoRealtimeChannel;
}

export interface DemoBackendClient {
  auth: {
    signInWithPassword: (credentials: {
      email: string;
      password: string;
    }) => Promise<DemoResult<{ user: DemoUser | null; session: DemoSession | null }>>;
    signUp: (credentials: {
      email: string;
      password: string;
    }) => Promise<DemoResult<{ user: DemoUser | null; session: DemoSession | null }>>;
    getUser: () => Promise<DemoResult<{ user: DemoUser | null }>>;
    updateUser: (attributes: { password?: string }) => Promise<DemoResult<{ user: DemoUser | null }>>;
    signOut: () => Promise<DemoResult<null>>;
  };
  from: (table: string) => DemoTableClient;
  storage: {
    from: (bucket: string) => DemoStorageBucket;
  };
  channel: (name?: string) => DemoRealtimeChannel;
  removeChannel: (channel: DemoRealtimeChannel) => Promise<'ok'>;
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

const createDemoStorageUrl = (bucket: string, filePath: string, expiresIn?: number) => {
  const basePath = normalizeAppBasePath();
  const params = new URLSearchParams({
    bucket,
    path: filePath,
  });

  if (expiresIn) {
    params.set('expiresIn', String(expiresIn));
  }

  return `${basePath}/demo-storage/?${params.toString()}`;
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
  authUsers: SEEDED_DEMO_ACCOUNTS.map(({ id, email, password }) => ({
    id,
    email,
    password,
  })),
  tables: {
    account_details: SEEDED_DEMO_ACCOUNTS.map(({ id, role, name, email }) => ({
      id,
      type: role,
      name,
      email,
    })),
    profile_details: [
      {
        id: 'demo-faculty-1',
        profession: 'Assistant Professor',
        description:
          'Assistant professor focused on software engineering, applied research, and student mentorship for CCIS capstone teams.',
        status: 'accepted',
      },
      {
        id: 'demo-faculty-2',
        profession: 'Lecturer',
        description:
          'Lecturer handling database systems, curriculum documentation, and industry-aligned learning assessments.',
        status: 'accepted',
      },
      {
        id: 'demo-faculty-3',
        profession: 'Associate Professor',
        description:
          'Research mentor focused on data analytics, quality assurance, and CHED-ready faculty credential reporting.',
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
      {
        id: 'demo-edu-2',
        user_id: 'demo-faculty-2',
        degree: 'B.S. Computer Science',
        institution: 'University of Makati',
        startDate: '2014-06-01',
        endDate: '2018-04-01',
      },
      {
        id: 'demo-edu-3',
        user_id: 'demo-faculty-3',
        degree: 'Ph.D. Information Systems',
        institution: 'Philippine research consortium',
        startDate: '2018-08-01',
        endDate: '2023-05-01',
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
      {
        id: 'demo-work-2',
        user_id: 'demo-faculty-2',
        role: 'Lecturer',
        organization: 'UMak CCIS',
        period: '2022 - Present',
        details: 'Coordinates database systems course materials and student lab assessments.',
      },
      {
        id: 'demo-work-3',
        user_id: 'demo-faculty-3',
        role: 'Research Coordinator',
        organization: 'UMak CCIS',
        period: '2020 - Present',
        details: 'Reviews faculty research evidence and publication records for department reports.',
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
      {
        id: 'demo-dev-2',
        user_id: 'demo-faculty-2',
        role: 'Cloud Database Bootcamp',
        organization: 'Industry partner workshop',
        period: '2026',
        details: 'Completed training on cloud-hosted database administration and backup planning.',
      },
      {
        id: 'demo-dev-3',
        user_id: 'demo-faculty-3',
        role: 'Faculty Analytics Colloquium',
        organization: 'CHED-aligned research forum',
        period: '2026',
        details: 'Presented a faculty credential analytics workflow for academic quality reporting.',
      },
    ],
    submissions: [
      {
        id: 'demo-submission-1',
        user_id: 'demo-faculty-1',
        document_type: 'Diplomas',
        file_name: 'sample-diploma.svg',
        status: 'Pending',
        created_at: demoNow(),
        submitted_at: demoNow(),
      },
      {
        id: 'demo-submission-2',
        user_id: 'demo-faculty-1',
        document_type: 'Certificates',
        file_name: 'sample-certificate.svg',
        status: 'Approved',
        created_at: demoNow(),
        submitted_at: demoNow(),
      },
      {
        id: 'demo-submission-3',
        user_id: 'demo-faculty-1',
        document_type: 'Transcript of records',
        file_name: 'sample-transcript.svg',
        status: 'Returned',
        created_at: demoNow(),
        submitted_at: demoNow(),
      },
      {
        id: 'demo-submission-4',
        user_id: 'demo-faculty-2',
        document_type: 'Curriculum Vitae',
        file_name: 'sample-cv.svg',
        status: 'Pending',
        created_at: demoNow(),
        submitted_at: demoNow(),
      },
      {
        id: 'demo-submission-5',
        user_id: 'demo-faculty-3',
        document_type: 'Research Publications',
        file_name: 'sample-research-summary.svg',
        status: 'Approved',
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
      {
        id: 'demo-log-2',
        user_id: 'demo-admin-1',
        action: 'LOGIN',
        details: 'Seeded admin reviewer session for dashboard analytics',
        timestamp: demoNow(),
      },
      {
        id: 'demo-log-3',
        user_id: 'demo-faculty-1',
        action: 'LOGIN',
        details: 'Seeded faculty session for dashboard analytics',
        timestamp: demoNow(),
      },
      {
        id: 'demo-log-4',
        user_id: 'demo-admin-1',
        action: 'APPROVAL_ACTION',
        details: 'Admin approved sample-certificate.svg',
        timestamp: demoNow(),
      },
    ],
  },
  storage: {
    'pictures-and-documents/demo-faculty-1/Diplomas/sample-diploma.svg': {
      bucket: 'pictures-and-documents',
      path: 'demo-faculty-1/Diplomas/sample-diploma.svg',
      name: 'sample-diploma.svg',
      updated_at: demoNow(),
      type: 'image/svg+xml',
      size: 1744,
    },
    'pictures-and-documents/demo-faculty-1/Certificates/sample-certificate.svg': {
      bucket: 'pictures-and-documents',
      path: 'demo-faculty-1/Certificates/sample-certificate.svg',
      name: 'sample-certificate.svg',
      updated_at: demoNow(),
      type: 'image/svg+xml',
      size: 1666,
    },
    'pictures-and-documents/demo-faculty-1/Transcript of records/sample-transcript.svg': {
      bucket: 'pictures-and-documents',
      path: 'demo-faculty-1/Transcript of records/sample-transcript.svg',
      name: 'sample-transcript.svg',
      updated_at: demoNow(),
      type: 'image/svg+xml',
      size: 1916,
    },
    'pictures-and-documents/demo-faculty-2/Curriculum Vitae/sample-cv.svg': {
      bucket: 'pictures-and-documents',
      path: 'demo-faculty-2/Curriculum Vitae/sample-cv.svg',
      name: 'sample-cv.svg',
      updated_at: demoNow(),
      type: 'image/svg+xml',
      size: 2120,
    },
    'pictures-and-documents/demo-faculty-3/Research Publications/sample-research-summary.svg': {
      bucket: 'pictures-and-documents',
      path: 'demo-faculty-3/Research Publications/sample-research-summary.svg',
      name: 'sample-research-summary.svg',
      updated_at: demoNow(),
      type: 'image/svg+xml',
      size: 2290,
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

export function getDemoStoredFileFromUrl(pathname: string, search = ''): DemoStoredFile | null {
  const query = search.startsWith('?') ? search : search ? `?${search}` : '';
  const params = new URLSearchParams(query);
  const queryBucket = params.get('bucket')?.trim();
  const queryFilePath = params.get('path')?.trim();

  if (queryBucket && queryFilePath) {
    const state = readState();
    const stored = state.storage[`${queryBucket}/${queryFilePath}`];
    return stored ? clone(stored) : null;
  }

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

const userFromAuth = (authUser: DemoAuthUser | undefined | null): DemoUser | null => {
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

const demoUserIdFromClerkId = (clerkUserId: string) => `clerk-${clerkUserId}`;

const sessionFromAuth = (authUser: DemoAuthUser): DemoSession => ({
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

export async function syncClerkDemoUser({
  clerkUserId,
  email,
  name,
}: ClerkDemoIdentity): Promise<DemoResult<{ user: DemoUser | null; session: DemoSession | null }>> {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedClerkUserId = clerkUserId.trim();

  if (!normalizedClerkUserId || !normalizedEmail) {
    return {
      data: { user: null, session: null },
      error: { message: 'Clerk demo sync requires a user id and email address' },
    };
  }

  const state = readState();
  const demoUserId = demoUserIdFromClerkId(normalizedClerkUserId);
  const displayName = name?.trim() || normalizedEmail.split('@')[0] || 'Clerk Faculty';
  const authUser = {
    id: demoUserId,
    email: normalizedEmail,
    password: '',
    provider: 'clerk' as const,
  };
  const existingAuthIndex = state.authUsers.findIndex((user) => user.id === demoUserId);

  if (existingAuthIndex >= 0) {
    state.authUsers[existingAuthIndex] = {
      ...state.authUsers[existingAuthIndex],
      ...authUser,
    };
  } else {
    state.authUsers.push(authUser);
  }

  const accountRows = ensureTable(state, 'account_details');
  const existingAccountIndex = accountRows.findIndex((row) => row.id === demoUserId);
  const account = {
    id: demoUserId,
    type: 'faculty',
    name: displayName,
    email: normalizedEmail,
    clerk_user_id: normalizedClerkUserId,
  };

  if (existingAccountIndex >= 0) {
    accountRows[existingAccountIndex] = {
      ...accountRows[existingAccountIndex],
      ...account,
    };
  } else {
    accountRows.push(account);
  }

  const profileRows = ensureTable(state, 'profile_details');
  if (!profileRows.some((row) => row.id === demoUserId)) {
    profileRows.push({ id: demoUserId });
  }

  state.currentUserId = demoUserId;
  writeState(state);

  return {
    data: { user: userFromAuth(authUser), session: sessionFromAuth(authUser) },
    error: null,
  };
}

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

  async single(): Promise<DemoResult<DemoRow | null>> {
    const { data } = await this.execute();
    if (data.length === 0) {
      return { data: null, error: { message: 'No rows found' } };
    }

    return { data: data[0], error: null };
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: DemoResult<DemoRow[]>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ) {
    return this.execute().then(onfulfilled, onrejected);
  }

  private async execute(): Promise<DemoResult<DemoRow[]>> {
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

  async match(filters: DemoRow): Promise<DemoResult<DemoRow[]>> {
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

const createTableClient = (table: string): DemoTableClient => ({
  select: (columns?: string) => new DemoSelectQuery(table, columns),
  insert: async (input: DemoRow | DemoRow[]): Promise<DemoResult<DemoRow[]>> => {
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

const createStorageBucket = (bucket: string): DemoStorageBucket => ({
  upload: async (
    filePath: string,
    file: Blob,
    _options?: DemoRow
  ): Promise<DemoResult<{ path: string }>> => {
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
  list: async (
    prefix = '',
    _options?: DemoRow
  ): Promise<DemoResult<DemoStoredFileListItem[]>> => {
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
  createSignedUrl: async (
    filePath: string,
    expiresIn: number
  ): Promise<DemoResult<{ signedUrl: string } | null>> => {
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
  remove: async (paths: string[]): Promise<DemoResult<string[]>> => {
    const state = readState();
    paths.forEach((filePath) => {
      delete state.storage[`${bucket}/${filePath}`];
    });
    writeState(state);

    return { data: paths, error: null };
  },
  download: async (filePath: string): Promise<DemoResult<Blob | null>> => {
    const state = readState();
    const stored = state.storage[`${bucket}/${filePath}`];
    if (!stored) {
      return { data: null, error: { message: 'File not found' } };
    }

    return { data: new Blob(['demo file'], { type: stored.type || 'text/plain' }), error: null };
  },
});

export function resetDemoBackendState() {
  const storage = getLocalStorage();
  memoryState = seedState();
  if (storage) {
    storage.setItem(DEMO_STORAGE_KEY, JSON.stringify(memoryState));
  }
}

export function setDemoCurrentUserId(userId: string | null) {
  const state = readState();
  state.currentUserId = userId;
  writeState(state);
}

export function updateDemoAuthUser(
  userId: string,
  attributes: { email?: string; password?: string }
) {
  const state = readState();
  const authUser = state.authUsers.find((user) => user.id === userId);

  if (!authUser) return false;

  if (attributes.email) authUser.email = attributes.email.trim().toLowerCase();
  if (attributes.password) authUser.password = attributes.password;
  writeState(state);
  return true;
}

export function deleteDemoAuthUser(userId: string) {
  const state = readState();
  const originalLength = state.authUsers.length;
  state.authUsers = state.authUsers.filter((user) => user.id !== userId);

  if (state.currentUserId === userId) {
    state.currentUserId = null;
  }

  writeState(state);
  return state.authUsers.length !== originalLength;
}

export function deleteDemoStoredFilesForUser(
  userId: string,
  bucket = 'pictures-and-documents'
) {
  const state = readState();
  const prefix = `${bucket}/${userId}/`;
  const originalLength = Object.keys(state.storage).length;

  for (const key of Object.keys(state.storage)) {
    if (key.startsWith(prefix)) {
      delete state.storage[key];
    }
  }

  writeState(state);
  return originalLength - Object.keys(state.storage).length;
}

export function isDemoBackendEnabled(_env: Record<string, string | undefined> = import.meta.env) {
  return true;
}

export function createDemoBackendClient(): DemoBackendClient {
  return {
    auth: {
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        const state = readState();
        const authUser = state.authUsers.find(
          (user) => user.provider !== 'clerk' && user.email === email && user.password === password
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
        return { data: null, error: null };
      },
    },
    from: (table: string) => createTableClient(table),
    storage: {
      from: (bucket: string) => createStorageBucket(bucket),
    },
    channel: (_name?: string) => ({
      on: function on(_event?: string, _filter?: DemoRow, _callback?: (payload: any) => void) {
        return this;
      },
      subscribe: function subscribe() {
        return this;
      },
    }),
    removeChannel: async (_channel: DemoRealtimeChannel) => 'ok',
  };
}
