import Array "mo:core/Array";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import List "mo:core/List";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  let projects = Map.empty<Text, Project>();

  let projectIds = List.empty<Text>();

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Blob storage
  include MixinStorage();

  // User profiles
  let userProfiles = Map.empty<Principal, UserProfile>();

  type Project = {
    id : Text;
    creator : Principal;
    name : Text;
    description : Text;
    createdTs : Time.Time;
    updatedTs : Time.Time;
    files : [Storage.ExternalBlob];
  };

  public type UserProfile = {
    name : Text;
  };

  module Project {
    public func compare(a : Project, b : Project) : Order.Order {
      Text.compare(a.name, b.name);
    };
  };

  // User profile management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Project management
  public shared ({ caller }) func createProject(name : Text, description : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create projects");
    };

    let projectId = name;
    if (projects.containsKey(projectId)) {
      Runtime.trap("Project already exists");
    };

    let newProject : Project = {
      id = projectId;
      creator = caller;
      name;
      description;
      createdTs = Time.now();
      updatedTs = Time.now();
      files = [];
    };

    projects.add(projectId, newProject);

    projectIds.add(projectId);
    projectId;
  };

  public query ({ caller }) func projectExists(projectId : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check project existence");
    };
    projects.containsKey(projectId);
  };

  public query ({ caller }) func getProject(projectId : Text) : async ?Project {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view projects");
    };
    projects.get(projectId);
  };

  public shared ({ caller }) func updateProjectDescription(projectId : Text, description : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update projects");
    };

    let project = getProjectById(projectId);
    if (caller != project.creator) {
      Runtime.trap("Only project creator can update project");
    };

    let updatedProject : Project = { project with description };
    projects.add(projectId, updatedProject);
  };

  public shared ({ caller }) func updateProjectName(projectId : Text, newName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update projects");
    };

    let project = getProjectById(projectId);
    if (caller != project.creator) {
      Runtime.trap("Only project creator can update project");
    };

    let updatedProject : Project = { project with name = newName };
    projects.add(projectId, updatedProject);
  };

  public shared ({ caller }) func addFileToProject(projectId : Text, file : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add files to projects");
    };

    let project = getProjectById(projectId);
    if (caller != project.creator) {
      Runtime.trap("Only project creator can add files to project");
    };

    let updatedFiles = project.files.concat([file]);
    let updatedProject : Project = { project with files = updatedFiles };
    projects.add(projectId, updatedProject);
  };

  public shared ({ caller }) func removeFileFromProject(projectId : Text, blob : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove files from projects");
    };

    let project = getProjectById(projectId);
    if (caller != project.creator) {
      Runtime.trap("Only project creator can remove files from project");
    };

    let filteredFiles = project.files.filter(func(file) { file != blob });
    let updatedProject : Project = { project with files = filteredFiles };
    projects.add(projectId, updatedProject);
  };

  public query ({ caller }) func getProjectIds() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list projects");
    };
    projectIds.toArray();
  };

  public query ({ caller }) func getAllProjects() : async [Project] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list projects");
    };
    projects.values().toArray().sort();
  };

  func getProjectById(projectId : Text) : Project {
    switch (projects.get(projectId)) {
      case (null) { Runtime.trap("Project does not exist") };
      case (?project) { project };
    };
  };
};
