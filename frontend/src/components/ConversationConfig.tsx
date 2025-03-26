'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Check, File, Plus, Trash2, Upload } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

// Types pour la configuration de conversation
interface Variable {
  name: string;
  description: string;
  defaultValue: string;
  required: boolean;
}

interface PdfDocument {
  _id: string;
  name: string;
  path: string;
  uploadDate: string;
}

interface ConversationConfig {
  _id: string;
  name: string;
  description: string;
  conversationType: string;
  contextParameters: Record<string, any>;
  variables: Variable[];
  pdfDocuments: PdfDocument[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ConversationConfig() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [configs, setConfigs] = useState<ConversationConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("list");
  const [selectedConfig, setSelectedConfig] = useState<ConversationConfig | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    conversationType: string;
    contextParameters: Record<string, any>;
    variables: Variable[];
    active: boolean;
  }>({
    name: "",
    description: "",
    conversationType: "custom",
    contextParameters: {},
    variables: [],
    active: true
  });
  const [newVariable, setNewVariable] = useState({
    name: "",
    description: "",
    defaultValue: "",
    required: false
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/conversation-configs');
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des configurations');
      }
      
      const data = await response.json();
      setConfigs(data);
      setError(null);
    } catch (err) {
      setError('Impossible de charger les configurations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchConfigs();
    }
  }, [mounted]);

  // ... reste du code existant ...

  if (!mounted) {
    return null;
  }

  return (
    <div className="container mx-auto py-6">
      {/* ... reste du JSX existant ... */}
    </div>
  );
} 