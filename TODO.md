# TODO - Add more features

- [x] Implement real-time remote cursor presence (cursor-update socket event + Monaco decorations)
- [x] Implement debounced collaboration updates (debounce broadcastChange per active file)
- [x] Implement view-only share mode (`?room=ID&mode=view`) and enforce it server-side (ignore code-change/files-sync when canEdit=false)
- [x] Update ShareModal UI to let user create both view-only and collaborate links

- [ ] Manual testing checklist:
  - [ ] 2+ clients in same room: remote cursors visible
  - [ ] Typing performance improved: fewer network broadcasts
  - [ ] View-only link: editor content cannot be edited; remote changes not sent
  - [ ] Collaborate link: edits propagate normally

