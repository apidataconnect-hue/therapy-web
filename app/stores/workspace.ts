import { defineStore } from 'pinia'
import type { Workspace } from '~/services/workspaceService'

export type { Workspace }

export interface WorkspaceState {
  workspaces: Workspace[]
}

export const useWorkspaceStore = defineStore('workspace', {
  state: (): WorkspaceState => ({
    workspaces: [],
  }),
  getters: {
    defaultWorkspace: (state) => state.workspaces.find(w => w.isDefault) ?? null,
  },
  actions: {
    setWorkspaces(workspaces: Workspace[]) {
      this.workspaces = workspaces
    },
    upsertWorkspace(workspace: Workspace) {
      const idx = this.workspaces.findIndex(w => w.id === workspace.id)
      if (idx !== -1) this.workspaces[idx] = workspace
      else this.workspaces.push(workspace)
    },
    removeWorkspace(id: string) {
      this.workspaces = this.workspaces.filter(w => w.id !== id)
    },
  },
})
