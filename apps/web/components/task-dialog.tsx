'use client';

import { useEffect } from 'react';
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
import { createTaskMutationFn, updateTaskMutationFn } from '@/lib/api';
import { toast } from 'sonner';
import { Loader } from 'lucide-react';

type TaskDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task & { id: string };
};

const TaskDialog = ({ open, onOpenChange, task }: TaskDialogProps) => {
  const queryClient = useQueryClient();
  const isEditMode = !!task;

  const form = useForm<Task>({
    resolver: zodResolver(taskSchema) as Resolver<Task>,
    defaultValues: {
      title: '',
      description: '',
      priority: 'LOW',
      dueDate: new Date(),
      status: 'TODO'
    }
  });

  // Sync form default values when the dialog opens or task changes
  useEffect(() => {
    if (open) {
      if (task) {
        form.reset({
          title: task.title,
          description: task.description,
          priority: task.priority,
          dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
          status: task.status
        });
      } else {
        form.reset({
          title: '',
          description: '',
          priority: 'LOW',
          dueDate: new Date(),
          status: 'TODO'
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
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error('Failed to update task', {
        description: error.message || 'An unexpected error occurred.'
      });
    }
  });

  const isPending = isCreating || isUpdating;

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
