'use client';

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

type TaskDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const TaskDialog = ({ open, onOpenChange }: TaskDialogProps) => {
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

  const onSubmit = (data: Task) => {
    console.log(data);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => onOpenChange(open)}
    >
      <DialogContent className='bg-white sm:max-w-md dark:bg-gray-950'>
        <DialogHeader className='border-b pb-3'>
          <DialogTitle>Add Task</DialogTitle>
          <DialogDescription>
            Fill out the details below to add a new task to your playground
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
                      placeholder='Enter task name'
                      className='placeholder:text-xs'
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
            >
              Close
            </Button>
          </DialogClose>
          <Button
            form='task-form'
            type='submit'
            className='bg-blue-800 text-white hover:cursor-pointer hover:bg-blue-900'
          >
            Add Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDialog;
