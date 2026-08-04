// The schema version this client build understands. Bump this whenever a
// renderer change adds a new component type or a new prop that older nodes
// can't be expected to have been authored against.
//
// A node with `minVersion` greater than this is treated exactly like an
// unknown component type: it renders the fallback (nothing, in production)
// instead of attempting to interpret props it may not understand. This is
// what lets an old client survive a payload built for a newer schema --
// the server can ship new node types/props to newer clients while older
// clients simply skip them, rather than misrendering or crashing.
export const CLIENT_SCHEMA_VERSION = 1;
