import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import styled, { css } from 'styled-components/macro';
import queryString from 'query-string';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import { Column, useSortBy, useTable } from 'react-table';
import Select from 'react-select';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Dropdown from 'react-bootstrap/Dropdown';

import { HeadingSection, StyledH1 } from 'commonStyles';
import { acCan, refreshAccessToken } from 'util/auth';
import { handleError, handleErrorAndPush } from 'util/plazaUtils';
import { Resources } from 'security/accessControl';
import {
  ApplicationDecisions,
  ApplicationExportTypes,
  Breakpoints,
  ConnectionError,
  GetApplicationsRequestParams,
  GetApplicationsResponse,
  NoPermissionError,
  RootState,
  SubmittedApplicationLite,
  UnknownError
} from 'types';
import { API_ROOT } from 'index';
import { enterApplicationReviewMode } from 'actions/applicationReview';

interface DecisionOptionTypes {
  value: ApplicationDecisions;
  label: string;
}

interface RowsPerPageOptionTypes {
  value: number;
  label: string;
}

const decisionOptions: DecisionOptionTypes[] = [
  { value: ApplicationDecisions.Accepted, label: 'Accepted Only' },
  { value: ApplicationDecisions.Rejected, label: 'Rejected Only' },
  { value: ApplicationDecisions.Undecided, label: 'Undecided Only' }
];

const rowsPerPageOptions: RowsPerPageOptionTypes[] = [
  { value: 10, label: '10 rows' },
  { value: 25, label: '25 rows' },
  { value: 50, label: '50 rows' },
  { value: 100, label: '100 rows' },
  { value: 250, label: '250 rows' }
];

const ManageSubmittedApplications = (): JSX.Element => {
  const dispatch = useDispatch();
  const history = useHistory();

  const accessToken = useSelector((state: RootState) => state.auth.jwtAccessToken);
  const reviewModeLoading = useSelector((state: RootState) => state.applicationReview.loading);
  const reviewModeEnabled = useSelector((state: RootState) => state.applicationReview.enabled);
  const reviewModeApplications = useSelector((state: RootState) => state.applicationReview.applicationNumbers);
  const userRole = useSelector((state: RootState) => state.user.role);

  const [tableReady, setTableReady] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  // Request parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [currentRequestParams, setCurrentRequestParams] = useState<GetApplicationsRequestParams>({});
  // Table data
  const [applications, setApplications] = useState<SubmittedApplicationLite[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalFoundApplications, setTotalFoundApplications] = useState(0);
  const [totalUndecidedApplications, setTotalUndecidedApplications] = useState(0);

  useEffect(() => {
    try {
      const permission = acCan(userRole).readAny(Resources.Applications);
      if (!permission.granted) throw new NoPermissionError();
    } catch (err) {
      handleErrorAndPush(err, history);
      return;
    }

    getApplications(currentRequestParams).catch(err => {
      handleError(err);
    });
  }, [currentRequestParams]);

  useEffect(() => {
    if (reviewModeEnabled) {
      const firstApplication = reviewModeApplications[0];
      history.push(`/admin/applications/${firstApplication}`);
    }
  }, [reviewModeEnabled]);

  const tableColumns: Array<Column<SubmittedApplicationLite>> = useMemo(() => [
    {
      Header: 'Application #',
      accessor: 'applicationNumber'
    },
    {
      Header: 'First Name',
      accessor: 'firstName'
    },
    {
      Header: 'Last Name',
      accessor: 'lastName'
    },
    {
      Header: 'Email',
      accessor: 'email'
    },
    {
      Header: 'Submitted On',
      Cell: ({ value }) => {
        return dayjs(value).format('M/DD/YY, h:mm A');
      },
      accessor: 'applicationTimestamp'
    },
    {
      Header: 'Decision',
      Cell: function Decision(cell) {
        switch (cell.value) {
          case ApplicationDecisions.Accepted:
            return <span style={{ color: 'green' }}>Accepted</span>;
          case ApplicationDecisions.Rejected:
            return <span style={{ color: 'red' }}>Rejected</span>;
          case ApplicationDecisions.Undecided:
            return <span style={{ color: 'gray' }}>Undecided</span>;
          default:
            return null;
        }
      },
      accessor: 'decision'
    }
  ], []);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable({
    columns: tableColumns,
    data: applications
  }, useSortBy);

  const getApplications = async (options?: GetApplicationsRequestParams, overriddenAccessToken?: string) => {
    setTableReady(false);
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    let queryParams = '';
    if (options) {
      queryParams = '?' + queryString.stringify(options);
    }

    let res;
    try {
      res = await fetch(`${API_ROOT}/applications${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (err) {
      throw new ConnectionError();
    }

    if (res.status === 200) {
      const resBody: GetApplicationsResponse = await res.json();

      setApplications(resBody.applications);
      setTotalPages(resBody.pages);
      setTotalFoundApplications(resBody.totalFoundApplications);
      setTotalUndecidedApplications(resBody.totalUndecidedApplications);

      setTableReady(true);
    } else if (res.status === 401) {
      const refreshedToken = await refreshAccessToken(history);
      await getApplications(options, refreshedToken);
    } else if (res.status === 403) {
      history.push('/');
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  const exportApplications = async (type: ApplicationExportTypes, overriddenAccessToken?: string) => {
    const token = overriddenAccessToken ? overriddenAccessToken : accessToken;

    let res;
    try {
      res = await fetch(`${API_ROOT}/applications/export?type=${type}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (err) {
      throw new ConnectionError();
    }

    if (res.status === 200) {
      const exportedFileBlob = await res.blob();
      saveAs(exportedFileBlob, `exported-applications.${type.toLowerCase()}`);
    } else if (res.status === 401) {
      refreshAccessToken(history)
        .then((refreshedToken) => exportApplications(type, refreshedToken))
        .catch(err => toast.error(err.message));
    } else if (res.status === 403) {
      history.push('/');
      throw new NoPermissionError();
    } else {
      throw new UnknownError();
    }
  };

  const handleExportApplications = async (type: ApplicationExportTypes) => {
    setIsExporting(true);

    try {
      await exportApplications(type);
    } catch (err) {
      handleError(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <HeadingSection>
        <StyledH1>Manage Applications</StyledH1>

        <ManageActions>
          <ApplicationCount>
            {tableReady
              ? `${totalUndecidedApplications} Awaiting Review`
              : 'Loading...'}
          </ApplicationCount>

          {tableReady &&
          <ActionButtons>
            <EnterReviewModeButton
              onClick={() => {
                try {
                  dispatch(enterApplicationReviewMode());
                } catch (err) {
                  handleError(err);
                }
              }}
              disabled={reviewModeLoading || totalUndecidedApplications < 1}
            >
              {reviewModeLoading ? 'Loading...' : 'Enter Review Mode'}
            </EnterReviewModeButton>

            <Dropdown>
              <ExportDropdownButton
                variant="secondary"
                disabled={isExporting}
              >
                Export
              </ExportDropdownButton>

              <Dropdown.Menu>
                <Dropdown.Item onClick={() => handleExportApplications(ApplicationExportTypes.CSV)}>
                  CSV
                </Dropdown.Item>

                <Dropdown.Item onClick={() => handleExportApplications(ApplicationExportTypes.JSON)}>
                  JSON
                </Dropdown.Item>

                <Dropdown.Item onClick={() => handleExportApplications(ApplicationExportTypes.XML)}>
                  XML
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </ActionButtons>
          }
        </ManageActions>
      </HeadingSection>

      <FilterSection>
        <Row>
          <StyledCol lg={6}>
            <SearchForm onSubmit={(e: React.FormEvent) => {
              e.preventDefault();
              setCurrentRequestParams({ ...currentRequestParams, searchQuery: searchQuery });
            }}>
              <Form.Control name="query"
                            type="text"
                            placeholder="Search for applications..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
              />

              <SearchButton variant="secondary" type="submit">Search</SearchButton>
            </SearchForm>
          </StyledCol>

          <StyledCol lg={3}>
            <Select
              options={decisionOptions}
              placeholder="Filter by decision"
              onChange={(option) => {
                const decision = option ? option.value : undefined;
                setCurrentPage(1);
                setCurrentRequestParams({ ...currentRequestParams, page: 1, decision: decision });
              }}
              isClearable
            />
          </StyledCol>

          <StyledCol lg={3}>
            <Select
              options={rowsPerPageOptions}
              placeholder="Rows per page"
              onChange={(option) => {
                const limit = option ? option.value : undefined;
                setCurrentPage(1);
                setCurrentRequestParams({ ...currentRequestParams, page: 1, limit: limit });
              }}
              isClearable
            />
          </StyledCol>
        </Row>
      </FilterSection>

      <Table responsive hover {...getTableProps}>
        <thead>
        {headerGroups.map((headerGroup, index) => (
          <tr {...headerGroup.getHeaderGroupProps()} key={index}>
            {headerGroup.headers.map((column, index) => (
              <th {...column.getHeaderProps(column.getSortByToggleProps())} key={index}>
                {column.render('Header')}
                {column.isSorted
                  ? column.isSortedDesc
                    ? ' 🔽'
                    : ' 🔼'
                  : ''}
              </th>
            ))}
          </tr>
        ))}
        </thead>

        <tbody {...getTableBodyProps()}>
        {rows.map((row, index) => {
          prepareRow(row);
          return (
            <ApplicationRow {...row.getRowProps()}
                            onClick={() => history.push(`/admin/applications/${row.values.applicationNumber}`)}
                            key={index}>
              {row.cells.map((cell, index) => {
                return (
                  <td {...cell.getCellProps()} key={index}>
                    {cell.render('Cell')}
                  </td>
                );
              })}
            </ApplicationRow>
          );
        })}
        </tbody>
      </Table>

      <PageControls>
        <PageIndicator>
          {totalFoundApplications > 0
            ? `Page ${currentPage} of ${totalPages} (${totalFoundApplications} result${totalFoundApplications === 1 ? '' : 's'} found)`
            : 'No results found'
          }
        </PageIndicator>

        <PageButtonContainer>
          <Button
            variant="outline-secondary"
            onClick={() => {
              if (currentPage <= 1) return;

              const newPage = currentPage - 1;
              setCurrentPage(newPage);
              setCurrentRequestParams({ ...currentRequestParams, page: newPage });
            }}
            disabled={currentPage <= 1}
          >
            Previous Page
          </Button>
          <NextPageButton
            variant="outline-secondary"
            onClick={() => {
              if (currentPage >= totalPages) return;

              const newPage = currentPage + 1;
              setCurrentPage(newPage);
              setCurrentRequestParams({ ...currentRequestParams, page: newPage });
            }}
            disabled={currentPage >= totalPages}
          >
            Next Page
          </NextPageButton>
        </PageButtonContainer>
      </PageControls>
    </>
  );
};

const ManageActions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 1rem;

  @media screen and (min-width: ${Breakpoints.Large}px) {
    flex-direction: row;
    margin-top: 0;
  }
`;

const ApplicationCount = styled.div`
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 1rem;

  @media screen and (min-width: ${Breakpoints.Large}px) {
    margin-bottom: 0;
    margin-right: 1rem;
  }
`;

const ActionButtons = styled.div`
  width: 100%;
  display: block;

  @media screen and (min-width: ${Breakpoints.Medium}px) {
    width: auto;
    display: flex;
    flex-direction: row;
  }
`;

const ButtonStyles = css`
  width: 100%;

  @media screen and (min-width: ${Breakpoints.Medium}px) {
    width: auto;
  }
`;

const EnterReviewModeButton = styled(Button)`
  ${ButtonStyles};
  margin-bottom: 0.75rem;

  @media screen and (min-width: ${Breakpoints.Large}px) {
    margin-bottom: 0;
    margin-right: 1rem;
  }
`;

const ExportDropdownButton = styled(Dropdown.Toggle)`
  ${ButtonStyles};
  display: flex;
  align-items: center;
  justify-content: center;
}
`;

const FilterSection = styled.section`
  margin-bottom: 1rem;
`;

const StyledCol = styled(Col)`
  margin-bottom: 0.5rem;

  @media screen and (min-width: ${Breakpoints.Large}px) {
    margin-bottom: 0;
  }
`;

const SearchForm = styled(Form)`
  display: flex;
  flex-direction: row;
`;

const SearchButton = styled(Button)`
  margin-left: 0.5rem;
`;

const ApplicationRow = styled.tr`
  &:hover {
    cursor: pointer;
  }

  &:active {
    background-color: lightgray;
  }
`;

const PageControls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  @media screen and (min-width: ${Breakpoints.Medium}px) {
    flex-direction: row;
    justify-content: space-between;
  }
`;

const PageIndicator = styled.div`
  margin-bottom: 1rem;
  font-weight: bold;

  @media screen and (min-width: ${Breakpoints.Medium}px) {
    margin-bottom: 0;
  }
`;

const PageButtonContainer = styled.div`
  display: flex;
`;

const NextPageButton = styled(Button)`
  margin-left: 0.5rem;
`;

export default ManageSubmittedApplications;
