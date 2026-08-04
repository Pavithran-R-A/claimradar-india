export var ClaimableStatus;
(function (ClaimableStatus) {
  ClaimableStatus['Detected'] = 'detected';
  ClaimableStatus['OfficialUpdate'] = 'official_update';
  ClaimableStatus['PotentialClaimable'] = 'potential_claimable';
  ClaimableStatus['VerifiedClaimable'] = 'verified_claimable';
  ClaimableStatus['RefundOrdered'] = 'refund_ordered';
  ClaimableStatus['RegistrationOpen'] = 'registration_open';
  ClaimableStatus['ProposedSettlement'] = 'proposed_settlement';
  ClaimableStatus['CollectiveCasePending'] = 'collective_case_pending';
  ClaimableStatus['IdentifiedUsersOnly'] = 'identified_users_only';
  ClaimableStatus['IndividualJudgment'] = 'individual_judgment';
  ClaimableStatus['Monitoring'] = 'monitoring';
  ClaimableStatus['Closed'] = 'closed';
  ClaimableStatus['Rejected'] = 'rejected';
  ClaimableStatus['Uncertain'] = 'uncertain';
})(ClaimableStatus || (ClaimableStatus = {}));
export var ProceduralStatus;
(function (ProceduralStatus) {
  ProceduralStatus['Final'] = 'final';
  ProceduralStatus['Interim'] = 'interim';
  ProceduralStatus['Proposed'] = 'proposed';
  ProceduralStatus['Appealed'] = 'appealed';
  ProceduralStatus['Pending'] = 'pending';
  ProceduralStatus['Closed'] = 'closed';
})(ProceduralStatus || (ProceduralStatus = {}));
export var UserRole;
(function (UserRole) {
  UserRole['User'] = 'user';
  UserRole['Researcher'] = 'researcher';
  UserRole['Editor'] = 'editor';
  UserRole['LegalReviewer'] = 'legal_reviewer';
  UserRole['Admin'] = 'admin';
})(UserRole || (UserRole = {}));
export var PublicationStatus;
(function (PublicationStatus) {
  PublicationStatus['Draft'] = 'draft';
  PublicationStatus['Published'] = 'published';
  PublicationStatus['Archived'] = 'archived';
})(PublicationStatus || (PublicationStatus = {}));
export var SourceType;
(function (SourceType) {
  SourceType['RSS'] = 'rss';
  SourceType['HTMLListing'] = 'html_listing';
  SourceType['HTMLDetail'] = 'html_detail';
  SourceType['PDFIndex'] = 'pdf_index';
  SourceType['CompanyNotice'] = 'company_notice';
  SourceType['Manual'] = 'manual';
})(SourceType || (SourceType = {}));
export var MatchConfidence;
(function (MatchConfidence) {
  MatchConfidence['StrongPotentialMatch'] = 'strong_potential_match';
  MatchConfidence['PossibleMatch'] = 'possible_match';
  MatchConfidence['InsufficientInformation'] = 'insufficient_information';
  MatchConfidence['NotMatched'] = 'not_matched';
})(MatchConfidence || (MatchConfidence = {}));
export var TrackerStatus;
(function (TrackerStatus) {
  TrackerStatus['Saved'] = 'saved';
  TrackerStatus['Reviewing'] = 'reviewing';
  TrackerStatus['GatheringProof'] = 'gathering_proof';
  TrackerStatus['SubmittedExternally'] = 'submitted_externally';
  TrackerStatus['AwaitingResponse'] = 'awaiting_response';
  TrackerStatus['Approved'] = 'approved';
  TrackerStatus['Rejected'] = 'rejected';
  TrackerStatus['Closed'] = 'closed';
})(TrackerStatus || (TrackerStatus = {}));
//# sourceMappingURL=index.js.map
