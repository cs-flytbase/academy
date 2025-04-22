import React, { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, YoutubeIcon } from "lucide-react";
import { toast } from "sonner";
import { Course } from "../types";

interface CourseFormProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  isEditing: boolean;
  onSuccess: () => void;
}

const CourseForm: React.FC<CourseFormProps> = ({
  isOpen,
  onClose,
  course,
  isEditing,
  onSuccess,
}) => {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState<string>(course?.playlist_id || "");
  
  // For edit mode
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    category: string;
    difficulty: string;
    thumbnail: string;
    watch_hour: string;
  }>({
    title: course?.title || "",
    description: course?.description || "",
    category: course?.category || "",
    difficulty: course?.difficulty || "beginner",
    thumbnail: course?.thumbnail || "",
    watch_hour: course?.watch_hour || "",
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (isEditing && course) {
      // For editing existing courses, require title
      if (!formData.title.trim()) {
        toast.error("Course title is required");
        return;
      }

      setLoading(true);
      try {
        // Update existing course
        const { error } = await supabase
          .from("courses")
          .update({
            title: formData.title,
            description: formData.description || null,
            playlist_id: playlistUrl || null, // Use the playlistUrl state for edit too
            thumbnail: formData.thumbnail || null,
            watch_hour: formData.watch_hour || null
            // Removed category and difficulty fields as they don't exist in the database schema
          })
          .eq("id", course.id);

        if (error) throw error;
        toast.success("Course updated successfully");
        onSuccess();
        onClose();
      } catch (error) {
        console.error("Error updating course:", error);
        toast.error("Failed to update course");
      } finally {
        setLoading(false);
      }
    } else {
      // For new courses, just require YouTube playlist URL
      if (!playlistUrl.trim()) {
        toast.error("YouTube playlist URL is required");
        return;
      }

      if (!playlistUrl.includes('youtube.com/playlist')) {
        toast.error("Please enter a valid YouTube playlist URL");
        return;
      }

      setLoading(true);
      try {
        // Simply send the URL to the webhook endpoint
        const response = await fetch(
          "https://srv-roxra.app.n8n.cloud/webhook/35ce5709-5702-4e41-b199-81cf683a5b32",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              playlist_url: playlistUrl,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        toast.success("YouTube playlist submitted successfully!");
        onSuccess();
        onClose();
      } catch (error) {
        console.error("Error submitting YouTube playlist:", error);
        toast.error("Failed to submit YouTube playlist");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <span>Edit Course: {course?.title}</span>
              </>
            ) : (
              <>
                <YoutubeIcon className="h-5 w-5 text-red-600" />
                <span>Import YouTube Playlist</span>
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update course details below."
              : "Simply paste a YouTube playlist URL and we'll do the rest."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {isEditing ? (
            /* Full form for editing courses */
            <>
              {/* Title */}
              <div className="grid gap-2">
                <Label htmlFor="title">Course Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter course title"
                />
              </div>

              {/* Description */}
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter course description"
                  className="min-h-[100px]"
                />
              </div>

              {/* Category */}
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="E.g., Web Development, AI, Data Science"
                />
              </div>

              {/* Difficulty */}
              <div className="grid gap-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) => handleSelectChange("difficulty", value)}
                >
                  <SelectTrigger id="difficulty">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* YouTube Playlist URL for edit mode */}
              <div className="grid gap-2">
                <Label htmlFor="playlist_url">YouTube Playlist URL (Optional)</Label>
                <Input
                  id="playlist_url"
                  value={playlistUrl}
                  onChange={(e) => setPlaylistUrl(e.target.value)}
                  placeholder="https://www.youtube.com/playlist?list=PLmINGqoqKHT1d59mxKqnj9X_uHx7NYpMn"
                />
              </div>

              {/* Thumbnail URL */}
              <div className="grid gap-2">
                <Label htmlFor="thumbnail">Thumbnail URL (Optional)</Label>
                <Input
                  id="thumbnail"
                  name="thumbnail"
                  value={formData.thumbnail}
                  onChange={handleChange}
                  placeholder="https://example.com/thumbnail.jpg"
                />
              </div>

              {/* Watch Hours */}
              <div className="grid gap-2">
                <Label htmlFor="watch_hour">Watch Hours (Optional)</Label>
                <Input
                  id="watch_hour"
                  name="watch_hour"
                  value={formData.watch_hour}
                  onChange={handleChange}
                  placeholder="E.g., 3h 45m"
                />
              </div>
            </>
          ) : (
            /* Simplified form for creating new courses */
            <div className="grid gap-2">
              <Label htmlFor="playlist_url" className="text-lg font-bold">
                YouTube Playlist URL *
              </Label>
              <div className="flex items-center space-x-2 mt-2 mb-4">
                <YoutubeIcon className="h-6 w-6 text-red-600" />
                <p className="text-sm">
                  Enter the URL of a YouTube playlist
                </p>
              </div>
              <Input
                id="playlist_url"
                value={playlistUrl}
                onChange={(e) => setPlaylistUrl(e.target.value)}
                placeholder="https://www.youtube.com/playlist?list=PLmINGqoqKHT1d59mxKqnj9X_uHx7NYpMn"
                className="text-base py-6"
              />
              <div className="bg-muted/30 p-4 rounded-md mt-2">
                <p className="text-sm text-muted-foreground">
                  <strong>What happens next?</strong>
                </p>
                <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1 mt-2">
                  <li>The YouTube playlist URL will be sent to our system</li>
                  <li>All processing will be handled automatically</li>
                  <li>No course data will be stored here - everything happens on the server</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            {isEditing ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CourseForm;
