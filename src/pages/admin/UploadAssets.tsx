import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, AlertCircle, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AssetUploader from "@/components/admin/AssetUploader";

const CHARACTERS = ["Blackboy", "Blackgirl", "Whiteboy", "Whitegirl"];
const THEMES = ["Fairytaletheme", "Superherotheme", "Wildanimaltheme"];
const TOTAL_LETTERS = 26;

interface FolderStatus {
  character: string;
  theme: string;
  uploadedCount: number;
  totalCount: number;
  isComplete: boolean;
}

const UploadAssets = () => {
  const navigate = useNavigate();
  const [folderStatuses, setFolderStatuses] = useState<FolderStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<{ character: string; theme: string } | null>(null);

  const checkExistingFiles = async () => {
    setLoading(true);
    const statuses: FolderStatus[] = [];

    for (const character of CHARACTERS) {
      for (const theme of THEMES) {
        const { data, error } = await supabase.storage
          .from("book-assets")
          .list(`${character}/${theme}`);

        const uploadedCount = error ? 0 : (data?.filter(f => f.name.endsWith('.jpg')).length || 0);
        
        statuses.push({
          character,
          theme,
          uploadedCount,
          totalCount: TOTAL_LETTERS,
          isComplete: uploadedCount >= TOTAL_LETTERS,
        });
      }
    }

    setFolderStatuses(statuses);
    setLoading(false);
  };

  useEffect(() => {
    checkExistingFiles();
  }, []);

  const totalUploaded = folderStatuses.reduce((sum, f) => sum + f.uploadedCount, 0);
  const totalRequired = CHARACTERS.length * THEMES.length * TOTAL_LETTERS;
  const overallProgress = totalRequired > 0 ? (totalUploaded / totalRequired) * 100 : 0;

  const handleUploadComplete = () => {
    checkExistingFiles();
    setSelectedFolder(null);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Upload Book Assets</h1>
            <p className="text-muted-foreground">Upload personalization images to Supabase Storage</p>
          </div>
        </div>

        {/* Overall Progress */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Progress value={overallProgress} className="flex-1" />
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                {totalUploaded} / {totalRequired} images
              </span>
            </div>
            {overallProgress === 100 && (
              <div className="flex items-center gap-2 mt-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">All images uploaded!</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Folder Uploader */}
        {selectedFolder && (
          <Card className="mb-6 border-primary">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Uploading: {selectedFolder.character} / {selectedFolder.theme}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedFolder(null)}>
                  Cancel
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <AssetUploader
                character={selectedFolder.character}
                theme={selectedFolder.theme}
                onComplete={handleUploadComplete}
              />
            </CardContent>
          </Card>
        )}

        {/* Folder Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 12 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))
          ) : (
            folderStatuses.map((folder) => (
              <Card
                key={`${folder.character}-${folder.theme}`}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  folder.isComplete ? "border-green-500/50 bg-green-50/50" : "hover:border-primary"
                } ${
                  selectedFolder?.character === folder.character && 
                  selectedFolder?.theme === folder.theme 
                    ? "ring-2 ring-primary" 
                    : ""
                }`}
                onClick={() => !folder.isComplete && setSelectedFolder({ 
                  character: folder.character, 
                  theme: folder.theme 
                })}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-foreground">{folder.character}</h3>
                      <p className="text-sm text-muted-foreground">{folder.theme}</p>
                    </div>
                    {folder.isComplete ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : folder.uploadedCount > 0 ? (
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                    ) : (
                      <Upload className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <Progress 
                    value={(folder.uploadedCount / folder.totalCount) * 100} 
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {folder.uploadedCount} / {folder.totalCount} images
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Instructions</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>1. Click on a folder card above to start uploading images for that combination.</p>
            <p>2. Drag and drop your JPG files (named 1.jpg to 26.jpg) into the upload area.</p>
            <p>3. Files will be automatically uploaded to the correct Supabase Storage path.</p>
            <p>4. Green checkmark indicates all 26 images are uploaded for that folder.</p>
            <p className="text-foreground font-medium mt-4">
              Expected file naming: 1.jpg, 2.jpg, 3.jpg, ... 26.jpg (representing letters A-Z)
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UploadAssets;
