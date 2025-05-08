import BpmnResource from "./BpmnResource";
import CasesResource from "./CaseResource";
import { BPMN, CASES, MEMBER_STAGING, PROJECTS, WORKSPACES } from "./config";
import MembersResource from "./MembersResource";
import ProjectResource from "./ProjectResources";
import WorkspaceResource from "./WorkspaceResource";
import AuthResources from "./AuthResources";

export class ApiWrapper {
  private readonly _auth: AuthResources;
  private readonly _cases: CasesResource;
  private readonly _bpmn: BpmnResource;
  private readonly _projects: ProjectResource;
  private readonly _workspace: WorkspaceResource;
  private readonly _members: MembersResource;

  constructor() {
    this._auth = new AuthResources("");
    this._cases = new CasesResource(CASES);
    this._bpmn = new BpmnResource(BPMN);
    this._projects = new ProjectResource(PROJECTS);
    this._workspace = new WorkspaceResource(WORKSPACES);
    this._members = new MembersResource(MEMBER_STAGING);
  }

  get auth(): AuthResources {
    return this._auth;
  }

  get cases(): CasesResource {
    return this._cases;
  }

  get bpmn(): BpmnResource {
    return this._bpmn;
  }

  get projects(): ProjectResource {
    return this._projects;
  }

  get workspaces(): WorkspaceResource {
    return this._workspace;
  }

  get members(): MembersResource {
    return this._members;
  }
}

const clearDilWrapper = new ApiWrapper();

export default clearDilWrapper;
