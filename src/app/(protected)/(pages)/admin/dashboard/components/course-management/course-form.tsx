import React, { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
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
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    category: string;
    difficulty: string;
    playlist_id: string;
    thumbnail: string;
  }>({
    title: course?.title || "",
    description: course?.description || "",
    category: course?.category || "",
    difficulty: course?.difficulty || "beginner",
    playlist_id: course?.playlist_id || "",
    thumbnail: course?.thumbnail || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validate form data
    if (!formData.title.trim()) {
      toast.error("Course title is required");
      return;
    }

    setLoading(true);
    try {
      if (isEditing && course) {
        // Update existing course
        const { error } = await supabase
          .from("courses")
          .update({
            title: formData.title,
            description: formData.description || null,
            // category and difficulty fields don't exist in the database schema
            playlist_id: formData.playlist_id || null,
            thumbnail: formData.thumbnail || null,
            // Include video_count if needed, but we normally don't update this manually
          })
          .eq("id", course.id);

        if (error) throw error;
        toast.success("Course updated successfully");
      } else {
        // Create new course
        const { error } = await supabase.from("courses").insert({
          title: formData.title,
          description: formData.description || null,
          // category and difficulty fields don't exist in the database schema
          playlist_id: formData.playlist_id || null,
          thumbnail: formData.thumbnail || null,
          // video_count will be handled separately or set to default
        });

        if (error) throw error;
        toast.success("Course created successfully");
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving course:", error);
      toast.error(isEditing ? "Failed to update course" : "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Course" : "Add New Course"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the course details below."
              : "Create a new course by filling out the form below."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
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

          {/* YouTube Playlist ID */}
          <div className="grid gap-2">
            <Label htmlFor="playlist_id">YouTube Playlist ID (Optional)</Label>
            <Input
              id="playlist_id"
              name="playlist_id"
              value={formData.playlist_id}
              onChange={handleChange}
              placeholder="E.g., PLlasXeu85E9cQ32gLCvAvr9vNaUccPVNm"
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
