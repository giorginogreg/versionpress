import { action, observable, runInAction } from 'mobx';
import * as request from 'superagent';

import DetailsLevel from '../enums/DetailsLevel';
import * as WpApi from '../services/WpApi';
import { getDiff, getGitStatus } from './utils';
import { getErrorMessage } from './utils';

import AppStore from './appStore';

class CommitPanelStore {
  @observable detailsLevel: DetailsLevel = DetailsLevel.None;
  @observable diff: string = null;
  @observable gitStatus: VpApi.GetGitStatusResponse = null;
  @observable error: string = null;
  @observable isLoading: boolean = false;

  @action
  private handleSuccess = (detailsLevel: DetailsLevel) => {
    if (detailsLevel === DetailsLevel.Overview) {
      return gitStatus => runInAction(() => {
        this.detailsLevel = detailsLevel;
        this.gitStatus = gitStatus;
        this.error = null;
        this.isLoading = false;
      });
    } else if (detailsLevel === DetailsLevel.FullDiff) {
      return diff => runInAction(() => {
        this.detailsLevel = detailsLevel;
        this.diff = diff;
        this.error = null;
        this.isLoading = false;
      });
    }
  };

  @action
  private handleError = (detailsLevel: DetailsLevel) => {
    return err => runInAction(() => {
      this.detailsLevel = detailsLevel;
      this.error = err.message;
      this.isLoading = false;
    });
  };

  @action
  private wpCommitDiscardEnd = (successMessage: string) => {
    return (err: any, res: request.Response) => {
      runInAction(() => {
        if (err) {
          AppStore.message = getErrorMessage(res, err);
        } else {
          AppStore.isDirtyWorkingDirectory = false;
          AppStore.message = {
            code: 'updated',
            message: successMessage,
          };
          AppStore.fetchCommits();
        }
      });

      return !err;
    };
  };

  @action
  changeDetailsLevel = (detailsLevel: DetailsLevel) => {
    if (detailsLevel === DetailsLevel.Overview && !this.gitStatus) {
      this.isLoading = true;
      getGitStatus()
        .then(this.handleSuccess(detailsLevel))
        .catch(this.handleError(detailsLevel));
      return;
    }

    if (detailsLevel === DetailsLevel.FullDiff && !this.diff) {
      this.isLoading = true;
      getDiff('')
        .then(this.handleSuccess(detailsLevel))
        .catch(this.handleError(detailsLevel));
      return;
    }

    this.detailsLevel = detailsLevel;
    this.error = null;
    this.isLoading = false;
  };

  @action
  commit = (message: string) => {
    AppStore.updateProgress({ percent: 0 });

    WpApi
      .post('commit')
      .send({ 'commit-message': message })
      .on('progress', AppStore.updateProgress)
      .end(this.wpCommitDiscardEnd('Changes have been committed.'));
  };

  @action
  discard = () => {
    AppStore.updateProgress({ percent: 0 });

    WpApi
      .post('discard-changes')
      .on('progress', AppStore.updateProgress)
      .end(this.wpCommitDiscardEnd('Changes have been discarded.'));
  };
}

const commitPanelStore = new CommitPanelStore();

export { CommitPanelStore };
export default commitPanelStore;
