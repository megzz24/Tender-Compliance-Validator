/*
Fetches requirements for a session on mount.
Exposes updateReq(), addReq(), deleteReq() with optimistic updates — updates local state immediately, 
then syncs to the API in the background.
Returns { reqs, setReqs, updateReq, addReq, deleteReq }.
*/