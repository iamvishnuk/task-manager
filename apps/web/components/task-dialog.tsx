'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskSchema, type Task } from '@task-manager/shared/schemas/task';
import { Button } from '@task-manager/ui/components/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@task-manager/ui/components/dialog';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@task-manager/ui/components/field';
import { Input } from '@task-manager/ui/components/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@task-manager/ui/components/select';
import { Textarea } from '@task-manager/ui/components/textarea';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createTaskMutationFn,
  updateTaskMutationFn,
  uploadFileMutationFn
} from '@/lib/api';
import { toast } from 'sonner';
import { Loader, Paperclip, Upload, X } from 'lucide-react';

type TaskDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task & { id: string };
};

const TaskDialog = ({ open, onOpenChange, task }: TaskDialogProps) => {
  const queryClient = useQueryClient();
  const isEditMode = !!task;
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const form = useForm<Task>({
    resolver: zodResolver(taskSchema) as Resolver<Task>,
    defaultValues: {
      title: '',
      description: '',
      priority: 'LOW',
      dueDate: new Date(),
      status: 'TODO',
      attachmentUrl: null,
      attachmentName: null
    }
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);
    try {
      const response = await uploadFileMutationFn(file);
      if (response.success) {
        form.setValue('attachmentUrl', response.data.url);
        form.setValue('attachmentName', response.data.filename);
        toast.success('File uploaded successfully!');
      } else {
        toast.error('File upload failed');
      }
    } catch (error: any) {
      toast.error('File upload failed', {
        description: error.message || 'An unexpected error occurred.'
      });
    } finally {
      setIsUploadingFile(false);
    }
  };

  // Sync form default values when the dialog opens or task changes
  useEffect(() => {
    if (open) {
      if (task) {
        form.reset({
          title: task.title,
          description: task.description,
          priority: task.priority,
          dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
          status: task.status,
          attachmentUrl: (task as any).attachmentUrl || null,
          attachmentName: (task as any).attachmentName || null
        });
      } else {
        form.reset({
          title: '',
          description: '',
          priority: 'LOW',
          dueDate: new Date(),
          status: 'TODO',
          attachmentUrl: null,
          attachmentName: null
        });
      }
    }
  }, [open, task, form]);

  const { mutate: createTask, isPending: isCreating } = useMutation({
    mutationFn: createTaskMutationFn,
    onSuccess: () => {
      toast.success('Task created successfully!');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-stats'] });
      form.reset({
        title: '',
        description: '',
        priority: 'LOW',
        dueDate: new Date(),
        status: 'TODO'
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error('Failed to create task', {
        description: error.message || 'An unexpected error occurred.'
      });
    }
  });

  const { mutate: updateTask, isPending: isUpdating } = useMutation({
    mutationFn: updateTaskMutationFn,
    onSuccess: () => {
      toast.success('Task updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-stats'] });
      if (task?.id) {
        queryClient.invalidateQueries({ queryKey: ['task', task.id] });
        queryClient.invalidateQueries({ queryKey: ['task-history', task.id] });
      }
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error('Failed to update task', {
        description: error.message || 'An unexpected error occurred.'
      });
    }
  });

  const isPending = isCreating || isUpdating || isUploadingFile;

  const onSubmit = (data: Task) => {
    if (isEditMode && task) {
      updateTask({ id: task.id, data });
    } else {
      createTask(data);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!isPending) {
          onOpenChange(open);
        }
      }}
    >
      <DialogContent className='bg-white sm:max-w-md dark:bg-gray-950'>
        <DialogHeader className='border-b pb-3'>
          <DialogTitle>{isEditMode ? 'Edit Task' : 'Add Task'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Modify the details of your task below'
              : 'Fill out the details below to add a new task to your playground'}
          </DialogDescription>
        </DialogHeader>
        <div>
          <form
            id='task-form'
            className='text-sm'
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FieldGroup className=''>
              <Controller
                name='title'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalide={fieldState.invalid}>
                    <FieldLabel>
                      Title <span className='text-red-500'>*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      placeholder='Enter task name'
                      className='placeholder:text-xs'
                      disabled={isPending}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name='description'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalide={fieldState.invalid}>
                    <FieldLabel>
                      Description <span className='text-red-500'>*</span>
                    </FieldLabel>
                    <Textarea
                      {...field}
                      aria-invalid={fieldState.invalid}
                      placeholder='Enter task description'
                      className='placeholder:text-xs'
                      disabled={isPending}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name='dueDate'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalide={fieldState.invalid}>
                    <FieldLabel>
                      Due Date <span className='text-red-500'>*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      type='date'
                      aria-invalid={fieldState.invalid}
                      placeholder='Select due date'
                      className='placeholder:text-xs'
                      disabled={isPending}
                      value={
                        field.value instanceof Date &&
                        !isNaN(field.value.getTime())
                          ? field.value.toISOString().split('T')[0]
                          : ''
                      }
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? new Date(e.target.value) : undefined
                        )
                      }
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Attachment File Upload Section */}
              <div className='flex flex-col gap-1.5'>
                <FieldLabel>Attachment</FieldLabel>
                {form.watch('attachmentUrl') ? (
                  <div className='flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/50 p-2 dark:border-slate-800 dark:bg-slate-900/30'>
                    <div className='flex items-center gap-2 overflow-hidden'>
                      <Paperclip className='size-4 shrink-0 text-slate-400' />
                      <span className='truncate text-xs font-medium text-slate-700 dark:text-slate-300'>
                        {form.watch('attachmentName') || 'Attachment'}
                      </span>
                    </div>
                    <button
                      type='button'
                      onClick={() => {
                        form.setValue('attachmentUrl', null);
                        form.setValue('attachmentName', null);
                      }}
                      className='rounded-md p-1 text-slate-400 hover:cursor-pointer hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300'
                    >
                      <X className='size-3.5' />
                    </button>
                  </div>
                ) : (
                  <label className='relative flex h-20 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/30 dark:hover:bg-slate-900/50'>
                    <div className='flex flex-col items-center justify-center gap-1.5 p-4 text-center'>
                      {isUploadingFile ? (
                        <>
                          <Loader className='size-5 animate-spin text-blue-800 dark:text-blue-500' />
                          <span className='text-xs text-slate-500'>
                            Uploading file...
                          </span>
                        </>
                      ) : (
                        <>
                          <Upload className='size-5 text-slate-400' />
                          <div className='flex flex-col gap-0.5'>
                            <span className='text-xs font-semibold text-blue-800 dark:text-blue-500'>
                              Click to upload
                            </span>
                            <span className='text-[10px] text-slate-400'>
                              Images or documents up to 5MB
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    <input
                      type='file'
                      className='hidden'
                      disabled={isUploadingFile || isPending}
                      onChange={handleFileUpload}
                    />
                  </label>
                )}
              </div>

              <Controller
                name='priority'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalide={fieldState.invalid}>
                    <FieldLabel>
                      Priority <span className='text-red-500'>*</span>
                    </FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isPending}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select Priority' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value='LOW'>Low</SelectItem>
                          <SelectItem value='MEDIUM'>Medium</SelectItem>
                          <SelectItem value='HIGH'>High</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name='status'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalide={fieldState.invalid}>
                    <FieldLabel>
                      Status <span className='text-red-500'>*</span>
                    </FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isPending}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select Status' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value='TODO'>TODO</SelectItem>
                          <SelectItem value='IN_PROGRESS'>
                            IN PROGRESS
                          </SelectItem>
                          <SelectItem value='DONE'>DONE</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </div>
        <DialogFooter className='bg-white dark:bg-gray-950'>
          <DialogClose asChild>
            <Button
              type='button'
              variant='outline'
              disabled={isPending}
            >
              Close
            </Button>
          </DialogClose>
          <Button
            form='task-form'
            type='submit'
            disabled={isPending}
            className='bg-blue-800 text-white hover:cursor-pointer hover:bg-blue-900'
          >
            {isPending && <Loader className='mr-2 size-4 animate-spin' />}
            {isEditMode ? 'Save Changes' : 'Add Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDialog;
