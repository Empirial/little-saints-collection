import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, AlertCircle, Upload, Book, Sparkles, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AssetUploader from "@/components/admin/AssetUploader";

const CHARACTERS = ["Blackboy", "Blackgirl", "Whiteboy", "Whitegirl"];
const THEMES = ["Fairytaletheme", "Superherotheme", "Wildanimaltheme"];
const SPECIAL_FOLDERS = ["Cover", "Intro", "Ending"];
const TOTAL_LETTERS = 26;

// Expected file counts for each folder type
const FOLDER_FILE_COUNTS: Record<string, number> = {
  "Cover": 1,      // cover.jpg
  "Intro": 2,      // 1.jpg, 2.jpg
  "Ending": 2,     // 1.jpg, 2.jpg
  "Fairytaletheme": 26,
  "Superherotheme": 26,
  "Wildanimaltheme": 26,
};

interface FolderStatus {
  character: string;
  folder: string;
  folderType: "special" | "theme";
  uploadedCount: number;
  totalCount: number;
  isComplete: boolean;
}

const UploadAssets = () => {
  const navigate = useNavigate();
  const [folderStatuses, setFolderStatuses] = useState<FolderStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<{ character: string; folder: string; folderType: "special" | "theme" } | null>(null);

  const checkExistingFiles = async () => {
    setLoading(true);
    const statuses: FolderStatus[] = [];

    for (const character of CHARACTERS) {
      // Check special folders (Cover, Intro, Ending)
      for (const folder of SPECIAL_FOLDERS) {
        const { data, error } = await supabase.storage
          .from("book-assets")
          .list(`${character}/${folder}`);

        const expectedCount = FOLDER_FILE_COUNTS[folder];
        const uploadedCount = error ? 0 : (data?.filter(f => {
          const n = f.name.toLowerCase();
          return n.endsWith('.jpg') || n.endsWith('.jpeg');
        }).length || 0);
        
        statuses.push({
          character,
          folder,
          folderType: "special",
          uploadedCount,
          totalCount: expectedCount,
          isComplete: uploadedCount >= expectedCount,
        });
      }

      // Check theme folders
      for (const theme of THEMES) {
        const { data, error } = await supabase.storage
          .from("book-assets")
          .list(`${character}/${theme}`);

        const uploadedCount = error ? 0 : (data?.filter(f => {
          const n = f.name.toLowerCase();
          return n.endsWith('.jpg') || n.endsWith('.jpeg');
        }).length || 0);
        
        statuses.push({
          character,
          folder: theme,
          folderType: "theme",
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

  const specialFolders = folderStatuses.filter(f => f.folderType === "special");
  const themeFolders = folderStatuses.filter(f => f.folderType === "theme");

  const totalUploaded = folderStatuses.reduce((sum, f) => sum + f.uploadedCount, 0);
  const totalRequired = folderStatuses.reduce((sum, f) => sum + f.totalCount, 0);
  const overallProgress = totalRequired > 0 ? (totalUploaded / totalRequired) * 100 : 0;

  const handleUploadComplete = () => {
    checkExistingFiles();
    setSelectedFolder(null);
  };

  const getFolderIcon = (folder: string) => {
    switch (folder) {
      case "Cover": return <Book className="h-5 w-5" />;
      case "Intro": return <Sparkles className="h-5 w-5" />;
      case "Ending": return <Heart className="h-5 w-5" />;
      default: return null;
    }
  };

  const getFolderDescription = (folder: string) => {
    switch (folder) {
      case "Cover": return "cover.jpg (front & back)";
      case "Intro": return "1.jpg, 2.jpg";
      case "Ending": return "1.jpg, 2.jpg";
      default: return "1.jpg - 26.jpg";
    }
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
                  Uploading: {selectedFolder.character} / {selectedFolder.folder}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedFolder(null)}>
                  Cancel
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <AssetUploader
                character={selectedFolder.character}
                folder={selectedFolder.folder}
                folderType={selectedFolder.folderType}
                expectedFileCount={FOLDER_FILE_COUNTS[selectedFolder.folder]}
                onComplete={handleUploadComplete}
              />
            </CardContent>
          </Card>
        )}

        {/* Special Folders Section (Cover, Intro, Ending) */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Book className="h-5 w-5" />
            Compulsory Pages (Cover, Intro, Ending)
          </h2>
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
              specialFolders.map((folder) => (
                <Card
                  key={`${folder.character}-${folder.folder}`}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    folder.isComplete ? "border-green-500/50 bg-green-50/50" : "hover:border-primary"
                  } ${
                    selectedFolder?.character === folder.character && 
                    selectedFolder?.folder === folder.folder 
                      ? "ring-2 ring-primary" 
                      : ""
                  }`}
                  onClick={() => !folder.isComplete && setSelectedFolder({ 
                    character: folder.character, 
                    folder: folder.folder,
                    folderType: folder.folderType
                  })}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getFolderIcon(folder.folder)}
                        <div>
                          <h3 className="font-medium text-foreground">{folder.character}</h3>
                          <p className="text-sm text-muted-foreground">{folder.folder}</p>
                        </div>
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
                      {folder.uploadedCount} / {folder.totalCount} ({getFolderDescription(folder.folder)})
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Theme Folders Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Letter Pages (A-Z by Theme)
          </h2>
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
              themeFolders.map((folder) => (
                <Card
                  key={`${folder.character}-${folder.folder}`}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    folder.isComplete ? "border-green-500/50 bg-green-50/50" : "hover:border-primary"
                  } ${
                    selectedFolder?.character === folder.character && 
                    selectedFolder?.folder === folder.folder 
                      ? "ring-2 ring-primary" 
                      : ""
                  }`}
                  onClick={() => !folder.isComplete && setSelectedFolder({ 
                    character: folder.character, 
                    folder: folder.folder,
                    folderType: folder.folderType
                  })}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium text-foreground">{folder.character}</h3>
                        <p className="text-sm text-muted-foreground">{folder.folder}</p>
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
        </div>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Instructions</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>1. Click on a folder card above to start uploading images for that combination.</p>
            <p>2. Drag and drop your JPG files into the upload area.</p>
            <p>3. Files will be automatically uploaded to the correct Supabase Storage path.</p>
            <p>4. Green checkmark indicates all required images are uploaded for that folder.</p>
            
            <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-2">
              <p className="text-foreground font-medium">Expected file naming:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Cover:</strong> cover.jpg (single spread with front & back cover)</li>
                <li><strong>Intro:</strong> 1.jpg, 2.jpg (two intro spreads)</li>
                <li><strong>Ending:</strong> 1.jpg, 2.jpg (two ending spreads)</li>
                <li><strong>Theme folders:</strong> 1.jpg to 26.jpg (letters A-Z)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UploadAssets;
