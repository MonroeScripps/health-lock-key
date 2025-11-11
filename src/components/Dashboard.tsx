import { RecordCard } from "./RecordCard";

const sampleRecords = [
  {
    id: 1,
    title: "Annual Physical Examination",
    date: "March 15, 2024",
    type: "Medical Report",
    isEncrypted: true,
    sharedWith: ["Dr. Sarah Johnson"],
  },
  {
    id: 2,
    title: "Blood Work Results",
    date: "March 10, 2024",
    type: "Lab Results",
    isEncrypted: true,
    sharedWith: ["Dr. Sarah Johnson", "Metro Health Insurance"],
  },
  {
    id: 3,
    title: "Dental Cleaning Record",
    date: "February 28, 2024",
    type: "Dental Record",
    isEncrypted: true,
    sharedWith: [],
  },
  {
    id: 4,
    title: "Allergy Test Results",
    date: "February 15, 2024",
    type: "Lab Results",
    isEncrypted: true,
    sharedWith: ["Dr. Sarah Johnson"],
  },
  {
    id: 5,
    title: "X-Ray Imaging",
    date: "January 20, 2024",
    type: "Imaging",
    isEncrypted: true,
    sharedWith: ["Dr. Michael Chen"],
  },
  {
    id: 6,
    title: "Prescription History",
    date: "January 10, 2024",
    type: "Medication Record",
    isEncrypted: true,
    sharedWith: ["Dr. Sarah Johnson", "Metro Health Insurance"],
  },
];

export const Dashboard = () => {
  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-2">Your Medical Records</h2>
          <p className="text-muted-foreground">
            All records are encrypted and stored securely. Control who has access with granular permissions.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleRecords.map((record) => (
            <RecordCard key={record.id} {...record} />
          ))}
        </div>
      </div>
    </section>
  );
};
