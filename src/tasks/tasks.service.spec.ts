import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TaskRepository } from './task.repository';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { NotFoundException } from '@nestjs/common';

const mockUser = {
  id: 1,
  username: 'Testuser',
};
const mockTaskRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  delete: jest.fn(),
});

describe('TaskService', () => {
  let tasksService;
  let taskRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRepository, useFactory: mockTaskRepository },
      ],
    }).compile();
    tasksService = await module.get<TasksService>(TasksService);
    taskRepository = await module.get<TaskRepository>(TaskRepository);
  });
  describe('getTasks', () => {
    it('get all tasks from repository', async () => {
      taskRepository.getTasks.mockResolvedValue('some');
      const filters: GetTasksFilterDto = {
        status: TaskStatus.IN_PROGRESS,
        search: 'search',
      };
      expect(taskRepository.getTasks).not.toHaveBeenCalled();
      const results = await tasksService.getTasks(filters, mockUser);
      expect(taskRepository.getTasks).toHaveBeenCalled();
      expect(results).toEqual('some');
    });
  });

  describe('getTaskById', () => {
    it('calls taskRepository.findOne() and successfully return task', async () => {
      const mockedTask = {
        title: 'Test task',
        description: 'description',
      };
      taskRepository.findOne.mockResolvedValue(mockedTask);
      const result = await tasksService.getTaskById(1, mockUser);
      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
          userId: mockUser.id,
        },
      });
      expect(result).toEqual(mockedTask);
    });
    it('throw an error as task is not found', async () => {
      taskRepository.findOne.mockResolvedValue(null);
      expect(tasksService.getTaskById(2, mockUser)).rejects.toThrow(
        NotFoundException,
      );
      expect(taskRepository.findOne).toHaveBeenCalled();
    });
  });

  describe('createTask', () => {
    it('should call taskRepository.createTask and return task', async () => {
      const mockedTask = {
        title: 'Test task',
        description: 'description',
      };
      taskRepository.createTask.mockResolvedValue(mockedTask);
      const result = await tasksService.createTask(mockedTask, mockUser);
      expect(taskRepository.createTask).toHaveBeenCalledWith(
        mockedTask,
        mockUser,
      );
      expect(result).toEqual(mockedTask);
    });
  });

  describe('deleteTask', () => {
    it('should taskRepository.delete deletes task', async () => {
      taskRepository.delete.mockResolvedValue({ affected: 1 } as any);
      expect(taskRepository.delete).not.toHaveBeenCalled();
      await tasksService.delete(1, mockUser);
      expect(taskRepository.delete).toHaveBeenCalled();
    });
    it('should throw an exception', () => {
      taskRepository.delete.mockResolvedValue({ affected: 0 } as any);
      expect(tasksService.delete).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateTaskStatus', () => {
    it('should update task status', async () => {
      const save = jest.fn().mockReturnValue(true);
      tasksService.getTaskById = jest.fn().mockReturnValue({
        status: TaskStatus.OPEN,
        save,
      });
      const result = await tasksService.updateTaskStatus(
        1,
        TaskStatus.DONE,
        mockUser,
      );
      expect(save).toHaveBeenCalled();
      expect(result.status).toEqual(TaskStatus.DONE);
    });
  });
});
